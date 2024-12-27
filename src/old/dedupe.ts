import 'dotenv/config';

import { DataTypes, Op, Sequelize } from 'sequelize'; // https://www.flightcontrol.dev/blog/ultimate-guide-to-multi-tenant-saas-data-modeling

// https://www.flightcontrol.dev/blog/ultimate-guide-to-multi-tenant-saas-data-modeling
// https://blog.bullettrain.co/teams-should-be-an-mvp-feature
// https://blitzjs.com/docs/multitenancy
// https://www.checklyhq.com/blog/building-a-multi-tenant-saas-data-model/
// https://www.stigg.io/blog-posts/entitlements-untangled-the-modern-way-to-software-monetization
// https://arnon.dk/why-you-should-separate-your-billing-from-entitlement/
// https://arnon.dk/design-your-pricing-and-tools-so-you-can-adapt-it-later/

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DATABASE_HOSTNAME,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : undefined,
  logging: false
});

const NotificationRecord = sequelize.define(
  'NotificationRecord',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
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
        name: 'unique_notification_records_key_expires_at',
        fields: ['key', 'expiresAt'],
        unique: true,
      },
    ],
  }
);

async function stuff() {
  for (let i = 0; i < 15; i++) {
    console.log(`now`, new Date());
    const dupe = await NotificationRecord.findOne({
      where: {
        key: 'blah',
        expiresAt: {
          [Op.gte]: sequelize.literal(`NOW()`),
        },
      },
      order: [['expiresAt', 'DESC']],
    });
    if (!dupe) {
      await NotificationRecord.create({
        key: 'blah',
        expiresAt: sequelize.literal(`NOW() + INTERVAL 1 SECOND`),
      });
      console.log('send');
    } else {
      console.log('dupe');
    }
    console.log('waiting');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

(async () => {
  await sequelize.sync({ force: true });
  await stuff();
  process.exit(0);
})();
