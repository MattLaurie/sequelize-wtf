import 'dotenv/config';

import { createId } from '@paralleldrive/cuid2';
import { Op, DataTypes, Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DATABASE_HOSTNAME,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : undefined,
  logging: false,
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
      {
        name: 'name_active_idx',
        fields: ['name', 'activeFrom', 'activeTo'],
      },
    ],
  }
);

async function stuff() {}

(async () => {
  await sequelize.sync({ force: true });
  await stuff();
})();
