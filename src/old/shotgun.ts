import 'dotenv/config';

import cluster from 'node:cluster';
import process from 'node:process';
import os from 'node:os';

import { createId } from '@paralleldrive/cuid2';
import { DataTypes, Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DATABASE_HOSTNAME,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : undefined,
  logging: false,
  retry: {
    max: 2,
    match: [
      /Deadlock/i
    ],
    // report: (msg, obj, err) => console.log('REPORT => ', { msg, obj, err }),
  },
});

const Thing = sequelize.define(
  'Thing',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: createId,
    },
    activeFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('NOW'),
    },
    activeTo: {
      type: DataTypes.DATE,
      allowNull: true,
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
        name: 'name_version_uniq',
        fields: ['name', 'version'],
        unique: true,
      },
      // {
      //   name: 'name_active_idx',
      //   fields: ['name', 'activeFrom', 'activeTo'],
      // },
    ],
  }
);

async function stuff() {
  const transaction = await sequelize.transaction();
  try {
    console.log(`Starting`);

    // const [count] = await Thing.update(
    //   {
    //     activeTo: sequelize.literal('NOW()'),
    //   },
    //   {
    //     where: {
    //       name: 'blah',
    //       activeTo: null,
    //     },
    //     transaction,
    //     logging: (...args) => console.log(args[0])
    //   },
    // );
    // console.log(`Updated ${count} rows`)
    // const active = await Thing.findAll({
    //   where: {
    //     name: 'blah',
    //     activeTo: null,
    //   },
    //   transaction,
    //   lock: true,
    //   logging: (...args) => console.log(args[0]),
    // });
    // const ids = active.map((m) => m.toJSON<{ id: number }>().id);
    // if (ids.length > 0) {
    //   await Thing.update(
    //     {
    //       activeTo: sequelize.literal('NOW()'),
    //     },
    //     {
    //       where: {
    //         id: ids,
    //       },
    //       transaction,
    //       logging: (...args) => console.log(args[0]),
    //     }
    //   );
    // }
    const thing = await Thing.create(
      {
        name: 'blah',
      },
      {
        transaction,
        logging: (...args) => console.log(args[0]),
      }
    );
    console.log(`Added ${thing.toJSON().id}`);
    await transaction.commit();
  } catch (error) {
    // await transaction.rollback();
    // console.log(error);
    // throw error;
  }
}
//
// (async () => {
//   await sequelize.sync({ force: true });
//   await stuff();
//   process.exit(0);
// })();

// const numCPUs = os.availableParallelism();
const numCPUs = 2;

if (cluster.isPrimary) {
  (async () => {
    await sequelize.sync({ force: true });
  })();
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker [${worker.process.pid}] exited`);
  });
} else {
  (async () => {
    // while (true) {
      console.log(`Insert [${process.pid}] exited`);
      await stuff();
      // await new Promise((resolve) => setTimeout(resolve, 1000 + 500 * Math.random()));
      await new Promise((resolve) => setTimeout(resolve, 0));
    // }
    process.exit(0);
  })();
}
