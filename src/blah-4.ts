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

const UserEntitlement = sequelize.define('UserEntitlement', {
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Users',
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

Plan.hasMany(PlanEntitlement);
Entitlement.hasMany(PlanEntitlement);
PlanEntitlement.belongsTo(Plan);
PlanEntitlement.belongsTo(Entitlement);

User.hasMany(UserEntitlement);
Entitlement.hasMany(UserEntitlement);
UserEntitlement.belongsTo(User);
UserEntitlement.belongsTo(Entitlement);

enum EntitlementType {
  ADVANCED_DASHBOARDS = 'ADVANCED_DASHBOARDS',
  DATA_RETENTION_DAYS = 'DATA_RETENTION_DAYS',
  FILE_STORAGE_MB = 'FILE_STORAGE_MB',
}

// interface BaseEntitlement {
//   type: EntitlementType;
// }
//
// abstract class BlahBaseEntitlement<P extends any> {
//   abstract parse(input: any): P | Promise<P>;
// }
//
// interface AdvancedDashboards {
//   type: EntitlementType.ADVANCED_DASHBOARDS;
// }
//
// class AdvancedDashboardsEntitlement extends BlahBaseEntitlement<AdvancedDashboards> {
//   parse(input: any): AdvancedDashboards {
//     return {
//       type: EntitlementType.ADVANCED_DASHBOARDS,
//     };
//   }
// }
//
// type DataRetentionDays = {
//   type: EntitlementType.DATA_RETENTION_DAYS
//   value: number;
// };
//
// class DataRetentionDaysEntitlement extends BlahBaseEntitlement<DataRetentionDays> {
//   parse(input: any): DataRetentionDays {
//     try {
//       const schema = z.object({
//         value: z.number().min(0).max(14),
//       }) satisfies ZodType<DataRetentionDays>;
//       return schema.parse(input);
//     } catch (error) {
//       if (error instanceof ZodError) {
//         const validationError = fromZodError(error);
//         throw new Error(`Error parsing params: ${validationError.toString()}`);
//       }
//       throw error;
//     }
//   }
// }

const setup = async () => {
  await sequelize.sync({ force: true });

  const freePlan = await Plan.create({
    name: 'Free',
  });
  const { id: FreePlanId } = freePlan.toJSON<{ id: number }>();

  const advancedDashboards = await Entitlement.create({
    type: EntitlementType.ADVANCED_DASHBOARDS,
    params: {},
  });
  const { id: AdvancedDashboardsEntitlementId } = advancedDashboards.toJSON<{ id: number }>();

  const dataRetentionDays = await Entitlement.create({
    type: EntitlementType.DATA_RETENTION_DAYS,
    params: {
      value: 14,
    },
  });
  const { id: DataRetentionDaysEntitlementId } = dataRetentionDays.toJSON<{ id: number }>();

  const fileStorageMb = await Entitlement.create({
    type: EntitlementType.FILE_STORAGE_MB,
    params: {
      limit: 1024,
    },
  });
  const { id: FileStorageMbEntitlementId } = fileStorageMb.toJSON<{ id: number }>();

  await Promise.all([
    PlanEntitlement.create({
      PlanId: FreePlanId,
      EntitlementId: AdvancedDashboardsEntitlementId,
    }),
    PlanEntitlement.create({
      PlanId: FreePlanId,
      EntitlementId: DataRetentionDaysEntitlementId,
    }),
    // PlanEntitlement.create({
    //   PlanId: FreePlanId,
    //   EntitlementId: FileStorageMbEntitlementId,
    // }),
  ]);

  const user = await User.create({});
  const { id: UserId } = user.toJSON<{ id: number }>();

  const freeEntitlements = await PlanEntitlement.findAll({
    where: {
      PlanId: FreePlanId,
    },
    include: [Plan, Entitlement],
  }).then((values) => {
    return values.map((value) => {
      return value.toJSON<{
        PlanId: number;
        EntitlementId: number;
        Entitlement: {
          id: number;
          params: any;
        };
        Plan: {
          id: number;
          name: string;
        };
        createdAt: Date;
        updatedAt: Date;
      }>();
    });
  });

  await Promise.all(
    freeEntitlements.map((entitlement) => {
      const {
        Entitlement: { id: EntitlementId, params },
      } = entitlement;
      return UserEntitlement.create({
        UserId,
        EntitlementId,
        params,
      });
    })
  );

  const userEntitlements = await Entitlement.findAll({
    include: [
      {
        model: UserEntitlement,
        where: {
          UserId,
        },
      },
    ],
  }).then((values) =>
    values.map((value) =>
      value.toJSON<{
        id: number;
        type: string;
        params: any;
        createdAt: Date;
        updatedAt: Date;
      }>()
    )
  );
  console.log(userEntitlements);
};

(async () => {
  await setup();
  process.exit(0);
})();
