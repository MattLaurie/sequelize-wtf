import 'dotenv/config';
import { DataTypes, Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DATABASE_HOSTNAME,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : undefined,
});

const Thing = sequelize.define('Thing', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: sequelize.fn('NOW'),
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: sequelize.fn('NOW'),
  },
});

const stuff = async () => {
  const models = await Thing.findAll({});
};

(async () => {
  await sequelize.sync({ force: true });
  await stuff();
  process.exit(0);
})();
