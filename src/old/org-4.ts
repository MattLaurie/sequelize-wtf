import 'dotenv/config';

import { DataTypes, Sequelize } from 'sequelize'; // https://www.flightcontrol.dev/blog/ultimate-guide-to-multi-tenant-saas-data-modeling

// https://www.flightcontrol.dev/blog/ultimate-guide-to-multi-tenant-saas-data-modeling
// https://blog.bullettrain.co/teams-should-be-an-mvp-feature
// https://blitzjs.com/docs/multitenancy
// https://www.checklyhq.com/blog/building-a-multi-tenant-saas-data-model/
// https://www.stigg.io/blog-posts/entitlements-untangled-the-modern-way-to-software-monetization
// https://arnon.dk/why-you-should-separate-your-billing-from-entitlement/

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DATABASE_HOSTNAME,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : undefined,
});

const Entitlement = sequelize.define('Entitlement', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_type',
  },
  params: {
    type: DataTypes.JSON,
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
});

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('STARTER', 'GROWTH', 'SCALE'),
    allowNull: false,
    defaultValue: 'STARTER',
  },
  name: {
    type: DataTypes.STRING,
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
});

const PlanEntitlement = sequelize.define('PlanEntitlement', {
  PlanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Plans',
      key: 'id',
    },
  },
  EntitlementId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Entitlements',
      key: 'id',
    },
  },
  params: {
    type: DataTypes.JSON,
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
});

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  PlanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Plans',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
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
});

const UsageLog = sequelize.define('UsageLog', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  OrganizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Organizations',
      key: 'id',
    },
  },
  EntitlementId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Entitlements',
    },
  },
  usage: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usageAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.fn('NOW'),
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

Entitlement.belongsToMany(Plan, {
  through: PlanEntitlement,
});

Plan.belongsToMany(Entitlement, {
  through: PlanEntitlement,
});

Plan.hasMany(PlanEntitlement);
PlanEntitlement.belongsTo(Plan);

Entitlement.hasMany(PlanEntitlement);
PlanEntitlement.belongsTo(Entitlement);

Organization.belongsTo(Plan);
Plan.hasMany(Organization);

Organization.hasMany(UsageLog);
UsageLog.belongsTo(Organization);

Entitlement.hasMany(UsageLog);
UsageLog.belongsTo(Entitlement);

async function stuff() {
  const [starter, growth] = await Promise.all([
    Plan.create({ name: 'Starter Plan', type: 'STARTER' }),
    Plan.create({ name: 'Growth Plan', type: 'GROWTH' }),
  ]);
  const { id: StarterPlanId } = starter.toJSON<{ id: number }>();
  const { id: GrowthPlanId } = growth.toJSON<{ id: number }>();

  const [org1, org2] = await Promise.all([
    Organization.create({ name: 'Org1', PlanId: StarterPlanId }),
    Organization.create({ name: 'Org2', PlanId: GrowthPlanId }),
  ]);
  const { id: Org1Id } = org1.toJSON<{ id: number }>();
  const { id: Org2Id } = org2.toJSON<{ id: number }>();

  const advancedDashboards = await Entitlement.create({
    type: 'advanced-dashboards',
    params: {},
  });
  const { id: AdvancedDashboardsId } = advancedDashboards.toJSON<{ id: number }>();

  const dataRetentionDays = await Entitlement.create({
    type: 'data-retention-days',
    params: {
      value: 14,
    },
  });
  const { id: DataRetentionDaysId } = dataRetentionDays.toJSON<{ id: number }>();

  const fileStorage = await Entitlement.create({
    type: 'file-storage-mb',
    params: {
      limit: 1024,
    },
  });
  const { id: FileStorageId } = fileStorage.toJSON<{ id: number }>();

  await Promise.all([
    PlanEntitlement.create({
      PlanId: StarterPlanId,
      EntitlementId: AdvancedDashboardsId,
      params: {},
    }),
    PlanEntitlement.create({
      PlanId: StarterPlanId,
      EntitlementId: DataRetentionDaysId,
      params: {},
    }),
    PlanEntitlement.create({
      PlanId: StarterPlanId,
      EntitlementId: FileStorageId,
      params: {},
    }),
  ]);

  await Promise.all([
    PlanEntitlement.create({
      PlanId: GrowthPlanId,
      EntitlementId: AdvancedDashboardsId,
      params: {},
    }),
    PlanEntitlement.create({
      PlanId: GrowthPlanId,
      EntitlementId: DataRetentionDaysId,
      params: {
        value: 30,
      },
    }),
    PlanEntitlement.create({
      PlanId: GrowthPlanId,
      EntitlementId: FileStorageId,
      params: {
        limit: 4096,
      },
    }),
  ]);

  // WITH RECURSIVE
  //     dates (day) AS (SELECT SUBDATE(CURDATE(), DAY(CURDATE()) - 1)
  //                     UNION ALL
  //                     SELECT day + INTERVAL 1 DAY
  //                     FROM dates
  //                     WHERE day < LAST_DAY(CURDATE())),
  //     results AS (SELECT DATE(usageAt) AS `Date`, SUM(`usage`) AS `Usage`
  //                 FROM UsageLogs
  //                 WHERE usageAt BETWEEN (SELECT MIN(day) FROM dates) AND (SELECT MAX(day) FROM dates)
  //                   AND OrganizationId = 1
  //                 GROUP BY DATE(usageAt))
  // SELECT DATE(day) AS `Date`, IF(results.`Usage` > 0, results.`Usage`, 0) AS `Usage`
  // FROM dates
  //          LEFT JOIN results ON results.`Date` = DATE(day);

  await Promise.all([
    UsageLog.create({
      OrganizationId: Org1Id,
      EntitlementId: FileStorageId,
      usage: 10,
    }),
  ]);

  const results = await Organization.findAll({
    where: {
      id: Org1Id,
    },
    include: [
      {
        model: Plan,
        include: [
          {
            model: PlanEntitlement,
            include: [
              {
                model: Entitlement,
              },
            ],
          },
        ],
      },
    ],
  });
  results.forEach((result) => {
    console.log(JSON.stringify(result.toJSON(), null, 2));
    // const {
    //   Plan: { PlanEntitlements },
    // } = result.toJSON<{
    //   Plan: {
    //     PlanEntitlements: {
    //       params: any;
    //       Entitlement: {
    //         type: string;
    //         params: any;
    //       };
    //     }[];
    //   };
    // }>();
    // const entitlements = PlanEntitlements.map((value) => {
    //   return {
    //     type: value.Entitlement.type,
    //     params: {
    //       ...value.Entitlement.params,
    //       ...value.params
    //     }
    //   }
    // })
    // const entitlements = PlanEntitlements.reduce((prev, value) => {
    //   return {
    //     ...prev,
    //     [value.Entitlement.type]: {
    //       ...value.Entitlement.params,
    //       ...value.params,
    //     },
    //   };
    // }, {});
    // console.log('entitlements', entitlements);
  });
}

(async () => {
  await sequelize.sync({ force: true });
  await stuff();
  process.exit(0);
})();
