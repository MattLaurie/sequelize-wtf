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

const Notification = sequelize.define(
  'Notification',
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
    status: {
      type: DataTypes.ENUM('ENQUEUED', 'PROCESSING', 'PROCESSED', 'FAILED'),
      allowNull: false,
      defaultValue: 'ENQUEUED',
    },
    enqueued: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    deduplicateKey: {
      type: DataTypes.STRING,
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
  delayInSeconds: 1,
  deduplicate: true,
};

const enqueue = async (
  type: string,
  params: any,
  options: Partial<EnqueueOptions>
): Promise<void> => {
  const resolvedOptions = {
    ...DEFAULT_ENQUEUE_OPTIONS,
    ...options,
  };
  const { delayInSeconds, deduplicate } = resolvedOptions;

  const deduplicateKey = deduplicate
    ? createHash('sha256')
        .update(type + JSON.stringify(params))
        .digest('hex')
    : undefined;

  const [model, created] = await Notification.upsert(
    {
      type,
      params,
      status: 'ENQUEUED',
      deduplicateKey: deduplicateKey,
      enqueued: true,
      scheduledAt: sequelize.literal(`NOW() + INTERVAL ${delayInSeconds} SECOND`),
    },
    {
      fields: ['scheduledAt'],
      transaction: null,
    }
  );
  // console.log('enqueue', {
  //   created,
  //   model: model.toJSON(),
  // });
};

type NotificationType = {
  id: number;
  type: string;
  params: any;
  status: string;
  deduplicateKey?: string;
  scheduledAt: Date;
};

async function nextNotifications(limit: number): Promise<NotificationType[]> {
  const transaction = await sequelize.transaction();
  try {
    const models = await Notification.findAll({
      where: {
        status: 'ENQUEUED',
        scheduledAt: {
          [Op.lte]: sequelize.literal(`NOW() + INTERVAL 2 SECOND`),
        },
      },
      transaction,
      limit,
      lock: true,
      skipLocked: true,
    });

    const notifications = models.map((model) =>
      model.toJSON<{
        id: number;
        type: string;
        params: any;
        status: string;
        deduplicateKey?: string;
        scheduledAt: Date;
      }>()
    );

    // await Notification.bulkCreate(
    //   notifications.map((notification) => ({
    //     id: notification.id,
    //     status: 'PROCESSING',
    //     enqueued: false,
    //   })),
    //   {
    //     updateOnDuplicate: ['status', 'enqueued'],
    //     transaction,
    //   }
    // );
    for (const notification of notifications) {
      await Notification.update(
        {
          status: 'PROCESSING',
          enqueued: false,
        },
        {
          where: {
            id: notification.id,
          },
          transaction,
        }
      );
    }

    await transaction.commit();

    return notifications;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

const addBatch = async () => {
  const added = await Promise.all(
    Array.from({ length: 10 }).map((v, index) =>
      enqueue(
        'blah',
        { hello: true, time: index % 2 },
        {
          delayInSeconds: 1,
        }
      )
    )
  );
  // console.log('added', added);
};

const stuff = async () => {
  console.log('added');

  await addBatch();

  for (let i = 0; i < 3; i++) {
    console.log(`next ${i}`);
    const notifications: NotificationType[] = await nextNotifications(5);
    console.log(notifications);
    const transaction = await sequelize.transaction();
    try {
      for (const notification of notifications) {
        const { id } = notification;
        console.log(`processed id=${id}`);
        await Notification.update(
          {
            status: 'PROCESSED',
            enqueued: false,
          },
          {
            where: {
              id,
            },
            transaction,
          }
        );
      }
      await transaction.commit();
    } catch (error) {
      console.log(`error ${i}`, error);
      await transaction.rollback();
    }
    await addBatch();
  }
};

(async () => {
  await sequelize.sync({ force: true });
  await stuff();
  process.exit(0);
})();
