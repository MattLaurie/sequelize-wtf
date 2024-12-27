import 'dotenv/config';
import { DataTypes, Sequelize } from 'sequelize';

const { createId } = require('@paralleldrive/cuid2');

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
    type: DataTypes.ENUM('ENQUEUED', 'SENT', 'FAILED'),
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

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('FREE', 'TEAM', 'CUSTOM'),
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

const Permission = sequelize.define('Permission', {
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

const User = sequelize.define(
  'User',
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
    email: {
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
  },
  {
    indexes: [
      {
        unique: true,
        name: 'unique_email',
        fields: ['email'],
      },
    ],
  }
);

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

const OrganizationEntitlement = sequelize.define('OrganizationEntitlement', {
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

const Member = sequelize.define(
  'Member',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    OrganizationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
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
      allowNull: false,
    },
    inviteName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inviteEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inviteToken: {
      type: DataTypes.STRING,
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
        unique: true,
        name: 'unique_invite_email',
        fields: ['OrganizationId', 'inviteEmail'],
      },
      {
        unique: true,
        name: 'unique_invite_token',
        fields: ['inviteToken'],
      },
    ],
  }
);

const MemberPermission = sequelize.define('MemberPermission', {
  MemberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Members',
      key: 'id',
    },
  },
  PermissionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Permissions',
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

const AccessToken = sequelize.define('AccessToken', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  OrganizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Organizations',
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

const AccessTokenPermission = sequelize.define('AccessTokenPermission', {
  AccessTokenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'AccessTokens',
      key: 'id',
    },
  },
  PermissionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Permissions',
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

const TrackingRequest = sequelize.define('TrackingRequest', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  OrganizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Organizations',
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

User.hasMany(Member);
Member.belongsTo(User);

Organization.hasMany(Member);
Member.belongsTo(Organization);

Organization.hasMany(Member);
TrackingRequest.belongsTo(Organization);

Organization.hasMany(AccessToken);
AccessToken.belongsTo(AccessToken);

Plan.hasMany(Organization);
Organization.belongsTo(Plan);

Organization.belongsToMany(Entitlement, {
  through: OrganizationEntitlement,
});
Entitlement.belongsToMany(Organization, {
  through: OrganizationEntitlement,
});

Member.belongsToMany(Permission, {
  through: MemberPermission,
});
Permission.belongsToMany(Member, {
  through: MemberPermission,
});

AccessToken.belongsToMany(Permission, {
  through: AccessTokenPermission,
});
Permission.belongsToMany(AccessToken, {
  through: AccessTokenPermission,
});

async function signup(
  userEmail: string,
  userName: string,
  organizationName: string,
  invites: { email: string; name: string; role: string }[]
): Promise<{
  OrganizationId: number;
}> {
  const transaction = await sequelize.transaction();
  try {
    const user = await User.create(
      {
        name: userName,
        email: userEmail,
      },
      {
        transaction,
      }
    );
    const { id: UserId } = user.toJSON<{ id: number }>();
    const organization = await Organization.create(
      {
        name: organizationName,
      },
      {
        transaction,
      }
    );
    const { id: OrganizationId } = organization.toJSON<{ id: number }>();
    const owner = await Member.create(
      {
        OrganizationId,
        UserId,
        role: 'OWNER',
      },
      {
        transaction,
      }
    );
    await Notification.create(
      {
        type: 'signup.welcome',
        params: {
          email: userEmail,
          name: userName,
          organizationId: OrganizationId,
          organizationName: organizationName,
        },
        status: 'ENQUEUED',
      },
      {
        transaction,
      }
    );
    for (const invite of invites) {
      const member = await Member.create(
        {
          OrganizationId,
          role: invite.role,
          inviteEmail: invite.email,
          inviteName: invite.name,
          inviteToken: createId(),
        },
        {
          transaction,
        }
      );
      const { inviteEmail, inviteName, inviteToken } = member.toJSON<{
        id: number;
        inviteEmail: string;
        inviteName: string;
        inviteToken: string;
      }>();

      await Notification.create(
        {
          type: 'signup.invite',
          params: {
            email: inviteEmail,
            name: inviteName,
            token: inviteToken,
            organizationId: OrganizationId,
            organizationName: organizationName,
            invitedByName: userName,
          },
          status: 'ENQUEUED',
        },
        {
          transaction,
        }
      );
    }
    await transaction.commit();
    return {
      OrganizationId,
    };
  } catch (error) {
    await transaction.rollback();
    throw error; // TODO
  }
}

const setup = async () => {
  await sequelize.sync({ force: true });

  try {
    const { OrganizationId } = await signup('user1@example.com', 'User 1', 'Organization 1', [
      {
        email: 'invite1@example.com',
        name: 'Invite 1',
        role: 'USER',
      },
      {
        email: 'invite2@example.com',
        name: 'Invite 2',
        role: 'ADMIN',
      },
    ]);

    const notifications = await Notification.findAll({
      where: {
        status: 'ENQUEUED',
      },
    });
    notifications.forEach((notification) => {
      console.log(notification.toJSON());
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await setup();
  process.exit(0);
})();
