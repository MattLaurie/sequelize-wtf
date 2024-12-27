import 'dotenv/config';
import * as crypto from 'node:crypto';

import { DataTypes, Sequelize, Op } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DATABASE_HOSTNAME,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : undefined,
});

const Notification = sequelize.define('Notification', {
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
    type: DataTypes.ENUM('ENQUEUED', 'PROCESSED', 'FAILED'),
    allowNull: false,
    defaultValue: 'ENQUEUED',
  },
  deduplicateId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deduplicateUntil: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  deduplicateCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
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
});

// https://www.inngest.com/blog/debouncing-in-queuing-systems-optimizing-efficiency-in-async-workflows

async function enqueue(type: string, params: any) {
  const deduplicateId = crypto
    .createHash('sha256')
    .update(type + JSON.stringify(params))
    .digest('hex');

  // if match deduplicateId and deduplicateUtil > now()
  // then increase deduplicateCount
  // else add

  const transaction = await sequelize.transaction();
  let notification = await Notification.findOne({
    where: {
      status: 'ENQUEUED',
      deduplicateId,
      deduplicateUntil: {
        [Op.lt]: new Date()
      }
    },
    transaction
  })

  await Notification.upsert({
    values: {
      type,
      params,
      deduplicateId,
      status: 'ENQUEUED',
    }
  })

}

const setup = async () => {
  await sequelize.sync({ force: true });

  await enqueue('blah', {});
  await enqueue('blah', {});

  const transaction = await sequelize.transaction();
  try {
    const notifications = await Notification.findAll({
      where: {
        status: 'ENQUEUED',
      },
      order: [['createdAt', 'ASC']],
      limit: 5,
      transaction,
      lock: true,
      skipLocked: true,
    });
    for (const notification of notifications) {
      const { id: NotificationId } = notification.toJSON<{ id: number }>();
      await Notification.update(
        {
          status: 'PROCESSED',
        },
        {
          where: {
            id: NotificationId,
          },
          transaction
        }
      );
    }
    await transaction.commit();
  } catch (error) {
    console.log(error);
    await transaction.rollback();
  }
};

(async () => {
  await setup();
  process.exit(0);
})();
