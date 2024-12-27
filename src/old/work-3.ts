import 'dotenv/config';

import { DataTypes, Op, Sequelize } from 'sequelize';
import { createHash } from 'node:crypto';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DATABASE_HOSTNAME,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : undefined,
});

// https://www.inngest.com/blog/debouncing-in-queuing-systems-optimizing-efficiency-in-async-workflows

const WorkRequest = sequelize.define(
  'WorkRequest',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    params: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    result: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('ENQUEUED', 'PROCESSING', 'PROCESSED', 'FAILED'),
      allowNull: false,
      defaultValue: 'ENQUEUED',
    },
    deduplicateKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    enqueued: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('NOW'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('NOW'),
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['deduplicateKey', 'enqueued'],
      },
    ],
  }
);

type EnqueueOptions = {
  delayInSeconds: number;
  deduplicate: boolean;
};

const DEFAULT_ENQUEUE_OPTIONS: EnqueueOptions = {
  delayInSeconds: 5,
  deduplicate: true,
};

async function enqueue(
  type: string,
  params: any,
  options: Partial<EnqueueOptions> = {}
): Promise<void> {
  const transaction = await sequelize.transaction();
  try {
    const { delayInSeconds, deduplicate } = { ...DEFAULT_ENQUEUE_OPTIONS, ...options };
    const deduplicateKey = deduplicate
      ? createHash('sha256')
          .update(type + JSON.stringify(params))
          .digest('hex')
      : undefined;
    const [model, created] = await WorkRequest.upsert(
      {
        type,
        params,
        status: 'ENQUEUED',
        deduplicateKey,
        enqueued: true,
        scheduledAt: sequelize.literal(`NOW() + INTERVAL ${delayInSeconds} SECOND`),
      },
      {
        fields: ['scheduledAt', 'enqueued'],
        transaction,
      }
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

type WorkRequestType = {
  id: number;
  type: string;
  params: any;
  status: string;
  deduplicateKey: string;
  scheduledAt: Date;
};

async function next(limit: number): Promise<WorkRequestType[]> {
  const transaction = await sequelize.transaction();
  try {
    const models = await WorkRequest.findAll({
      where: {
        status: 'ENQUEUED',
        scheduledAt: {
          [Op.lte]: sequelize.literal(`NOW() + INTERVAL 1 SECOND`),
        },
      },
      limit,
      transaction,
      lock: true,
      skipLocked: true,
    });

    const WorkRequests = models.map((model) => model.toJSON<WorkRequestType>());

    await WorkRequest.bulkCreate(
      WorkRequests.map((WorkRequest) => ({
        id: WorkRequest.id,
        status: 'PROCESSING',
        enqueued: null,
      })),
      {
        updateOnDuplicate: ['status', 'enqueued'],
        transaction,
      }
    );

    await transaction.commit();
    return WorkRequests;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function delay(millis: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
}

async function addBatch(length: number, options: Partial<EnqueueOptions> = {}) {
  return Promise.all(
    Array.from({ length }).map((_, index) => enqueue('blah', { type: index % 5 }, options))
  );
}

async function stuff() {
  await addBatch(10, {
    delayInSeconds: 5,
  });

  for (let i = 0; i < 60; i++) {
    console.log('Waiting 1s');
    await delay(1000);
    const requests = await next(5);
    console.log('WorkRequests', requests.length);
    const transaction = await sequelize.transaction();
    try {
      for (const request of requests) {
        const { id, type, params } = request;
        await WorkRequest.update(
          {
            status: 'PROCESSED',
          },
          {
            where: {
              id,
            },
            transaction,
          }
        );
        console.log('request', request);
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
    }
    if (i % 5 === 0) {
      await addBatch(10, {
        delayInSeconds: 5,
        deduplicate: false
      });
    }
  }
}

(async () => {
  await sequelize.sync({ force: true });
  await stuff();
  process.exit(0);
})();
