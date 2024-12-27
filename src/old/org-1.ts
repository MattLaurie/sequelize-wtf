import 'dotenv/config';
import { DataTypes, Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DATABASE_HOSTNAME,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : undefined,
});

// https://www.flightcontrol.dev/blog/ultimate-guide-to-multi-tenant-saas-data-modeling
// https://blog.bullettrain.co/teams-should-be-an-mvp-feature
// https://blitzjs.com/docs/multitenancy
// https://www.checklyhq.com/blog/building-a-multi-tenant-saas-data-model/
// https://www.stigg.io/blog-posts/entitlements-untangled-the-modern-way-to-software-monetization
// https://arnon.dk/why-you-should-separate-your-billing-from-entitlement/

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
  },
  params: {
    type: DataTypes.JSON,
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

const Plan = sequelize.define('Plan', {
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
  type: {
    type: DataTypes.ENUM('FREE', 'TEAM', 'ENTERPRISE'),
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

const User = sequelize.define('User', {
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
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_email'
  },
  type: {
    type: DataTypes.ENUM('CUSTOMER', 'ADMIN'),
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  PlanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Plans',
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

const Member = sequelize.define('Member', {
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
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  role: {
    type: DataTypes.ENUM('USER', 'ADMIN', 'OWNER'),
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

User.belongsToMany(Organization, {
  through: 'Member',
});
Organization.belongsToMany(User, {
  through: 'Member',
});
Member.belongsTo(User);
Member.belongsTo(Organization);

Entitlement.belongsToMany(Plan, {
  through: 'PlanEntitlement',
});
Plan.belongsToMany(Entitlement, {
  through: 'PlanEntitlement',
});

const setup = async () => {
  await sequelize.sync({ force: true });

  // Organization has entitlements
  // Organization has feature flags
  // User has feature flags
  // User has permissions

  const poMgmtModel = await Entitlement.create({
    type: 'purchase-order-management',
    name: 'PO Management',
    params: {},
  });
  const poMgmt = poMgmtModel.toJSON<{ id: number; params: any }>();

  const deliveriesMgmtModel = await Entitlement.create({
    type: 'deliveries-management',
    name: 'Deliveries',
    params: {},
  });
  const deliveriesMgmt = deliveriesMgmtModel.toJSON<{ id: number; params: any }>();

  const cargoSyncModel = await Entitlement.create({
    type: 'cargo-sync',
    name: 'Cargo Sync',
    params: {
      max: 10,
    },
  });
  const cargoSync = cargoSyncModel.toJSON<{ id: number; params: any }>();

  const freePlan = await Plan.create({
    name: 'Free Plan',
    type: 'FREE',
  });
  const { id: FreePlanId } = freePlan.toJSON<{ id: number }>();

  await Promise.all([
    PlanEntitlement.create({
      PlanId: FreePlanId,
      EntitlementId: cargoSync.id,
      params: {},
    }),
  ]);

  const teamPlan = await Plan.create({
    name: 'Team Plan',
    type: 'TEAM',
  });
  const { id: TeamPlanId } = teamPlan.toJSON<{ id: number }>();

  await Promise.all([
    PlanEntitlement.create({
      PlanId: TeamPlanId,
      EntitlementId: cargoSync.id,
      params: {
        limit: 100,
      },
    }),
    PlanEntitlement.create({
      PlanId: TeamPlanId,
      EntitlementId: poMgmt.id,
      params: {},
    }),
    PlanEntitlement.create({
      PlanId: TeamPlanId,
      EntitlementId: deliveriesMgmt.id,
      params: {},
    }),
  ]);

  // --

  const user = await User.create({
    name: 'User',
    email: 'user@example.com',
    type: 'CUSTOMER',
  });
  const { id: UserId } = user.toJSON<{ id: number }>();
  const organization1 = await Organization.create({
    name: 'Org - Free Plan',
    PlanId: FreePlanId,
  });
  const { id: Organization1Id } = organization1.toJSON<{ id: number }>();
  const member1 = await Member.create({
    OrganizationId: Organization1Id,
    UserId,
    role: 'OWNER',
  });

  const organization2 = await Organization.create({
    name: 'Org - Team Plan',
    PlanId: TeamPlanId,
  });
  const { id: Organization2Id } = organization2.toJSON<{ id: number }>();
  const member2 = await Member.create({
    OrganizationId: Organization2Id,
    UserId,
    role: 'USER',
  });

  // --

};

(async () => {
  await setup();
  process.exit(0);
})();
