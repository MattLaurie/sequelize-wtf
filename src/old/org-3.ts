import 'dotenv/config';

import { DataTypes, Sequelize } from 'sequelize'; // https://www.flightcontrol.dev/blog/ultimate-guide-to-multi-tenant-saas-data-modeling

// https://www.flightcontrol.dev/blog/ultimate-guide-to-multi-tenant-saas-data-modeling
// https://blog.bullettrain.co/teams-should-be-an-mvp-feature
// https://blitzjs.com/docs/multitenancy
// https://www.checklyhq.com/blog/building-a-multi-tenant-saas-data-model/
// https://www.stigg.io/blog-posts/entitlements-untangled-the-modern-way-to-software-monetization
// https://arnon.dk/why-you-should-separate-your-billing-from-entitlement/

/* eslint-disable no-use-before-define */
export type JSONPrimitive = string | number | boolean | null;

export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

export type JSONObject = { [Key in string]: JSONValue } & {
  [Key in string]?: JSONValue;
};

export type JSONArray = JSONValue[] | readonly JSONValue[];

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DATABASE_HOSTNAME,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : undefined,
  logging: false
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
    type: DataTypes.ENUM('STARTER', 'TEAM', 'COMPANY', 'ENTERPRISE'),
    allowNull: false,
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
    allowNull: true,
    references: {
      model: 'Entitlements',
      key: 'id',
    },
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

const Usage = sequelize.define('Usage', {
  OrganizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Organizations',
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
  count: {
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

Plan.belongsToMany(Entitlement, {
  through: 'PlanEntitlement',
});
Entitlement.belongsToMany(Plan, {
  through: 'PlanEntitlement',
});
Plan.hasMany(Organization);
Organization.belongsTo(Plan);

Organization.hasMany(Usage);
Usage.belongsTo(Organization);

Entitlement.hasMany(Usage);
Usage.belongsTo(Entitlement);

async function hasEntitlement(organizationId: number, type: string): Promise<boolean> {
  const entitlement = await Entitlement.findOne({
    where: {
      type,
    },
    include: [
      {
        model: Plan,
        attributes: ['id', 'name', 'type'],
        include: [
          {
            model: Organization,
            attributes: ['id', 'name', 'PlanId'],
            where: {
              id: organizationId,
            },
          },
        ],
      },
      // {
      //   model: Usage,
      //   attributes: ['count'],
      //   where: {
      //     OrganizationId: organizationId,
      //   },
      //   required: false,
      // },
    ],
    raw: true
  });
  console.log(entitlement);
  return entitlement !== undefined;
}

async function stuff() {
  const advancedDashboards = await Entitlement.create({
    type: 'advanced-dashboards',
    params: {},
  });
  const { id: AdvancedDashboardsId } = advancedDashboards.toJSON<{ id: number }>();

  const fileStorageLow = await Entitlement.create({
    type: 'file-storage-low',
    params: {
      limit: 1024
    },
  });
  const { id: FileStorageLowId } = fileStorageLow.toJSON<{ id: number }>();

  const fileStorageHigh = await Entitlement.create({
    type: 'file-storage-high',
    params: {
      limit: 1024
    },
  });
  const { id: FileStorageHighId } = fileStorageHigh.toJSON<{ id: number }>();

  const starterPlan = await Plan.create({
    type: 'STARTER',
    name: 'Starter',
  });
  const { id: StarterPlanId } = starterPlan.toJSON<{ id: number }>();
  await Promise.all([
    PlanEntitlement.create({
      PlanId: StarterPlanId,
      EntitlementId: AdvancedDashboardsId,
    }),
    PlanEntitlement.create({
      PlanId: StarterPlanId,
      EntitlementId: FileStorageLowId,
    }),
  ]);

  const teamPlan = await Plan.create({
    type: 'TEAM',
    name: 'Team',
  });
  const { id: TeamPlanId } = teamPlan.toJSON<{ id: number }>();
  await Promise.all([
    PlanEntitlement.create({
      PlanId: TeamPlanId,
      EntitlementId: AdvancedDashboardsId,
    }),
    PlanEntitlement.create({
      PlanId: TeamPlanId,
      EntitlementId: FileStorageHighId,
    }),
  ]);

  const organization1 = await Organization.create({
    name: 'org1',
    PlanId: StarterPlanId,
  });
  const { id: Organization1Id } = organization1.toJSON<{ id: number }>();

  await Usage.create({
    OrganizationId: Organization1Id,
    EntitlementId: AdvancedDashboardsId,
    count: 0,
  });

  await Usage.update(
    {
      count: 1,
    },
    {
      where: {
        OrganizationId: Organization1Id,
        EntitlementId: AdvancedDashboardsId,
      },
    }
  );

  const organization2 = await Organization.create({
    name: 'org2',
    PlanId: TeamPlanId,
  });
  const { id: Organization2Id } = organization2.toJSON<{ id: number }>();

  // const blah = await Organization.findByPk(OrganizationId, {
  //   attributes: ['id', 'name', 'PlanId'],
  //   include: [
  //     {
  //       model: Plan,
  //       attributes: ['id', 'name', 'type'],
  //       include: [
  //         {
  //           model: Entitlement,
  //           attributes: ['id', 'type', 'params'],
  //           where: {
  //             type: 'advanced-dashboards',
  //           }
  //         }
  //       ]
  //     }
  //   ]
  // });

  await Promise.all(
    [
      [Organization1Id, 'advanced-dashboards'] as const,
      [Organization2Id, 'advanced-dashboards'] as const,
    ].map(async ([orgId, type]) => {
      const result = await hasEntitlement(orgId, type);
      return `${orgId} has ${type}? ${result}`;
    })
  ).then((msgs) => msgs.forEach((msg) => console.log(msg)));
}

(async () => {
  await sequelize.sync({ force: true });
  await stuff();
  process.exit(0);
})();
