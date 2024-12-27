import 'dotenv/config';
import { DataTypes, Sequelize } from 'sequelize';
import { createId } from '@paralleldrive/cuid2';

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
        unique: 'unique_email',
      },
      role: {
        type: DataTypes.ENUM('CUSTOMER', 'SUPERADMIN'),
        allowNull: false,
        defaultValue: 'CUSTOMER',
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

const Membership = sequelize.define(
    'Membership',
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
      InvitedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      inviteToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      inviteName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      inviteEmail: {
        // TODO index
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
      indexes: [{ fields: ['inviteToken'] }],
    }
);

const Project = sequelize.define('Project', {
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

Organization.hasMany(Membership);
Membership.belongsTo(Organization);
User.hasMany(Membership);
Membership.belongsTo(User);
Organization.hasMany(Project);
Project.belongsTo(Organization);

const signup = async (name: string, email: string) => {
  const org = await Organization.create({
    name: 'Default Org',
  });
  const { id: OrganizationId } = org.toJSON<{ id: number }>();

  const user = await User.create({
    name,
    email,
    role: 'CUSTOMER',
  });
  const { id: UserId } = user.toJSON<{ id: number }>();

  const membership = await Membership.create({
    OrganizationId,
    UserId,
    role: 'OWNER',
  });
};

const invite = async (OrganizationId: number, UserId: number, name: string, email: string) => {
  const org = await Organization.findByPk(OrganizationId);
  const membership = await Membership.create({
    OrganizationId,
    InvitedByUserId: UserId,
    inviteToken: createId(),
    inviteName: name,
    inviteEmail: email,
    role: 'USER',
  });
  const { inviteToken } = membership.toJSON<{ id: number; inviteToken: string }>();
  return {
    email,
    inviteToken,
  };
};

const accept = async (token: string) => {
  // TODO assumes any membership invitation with a non-null UserId is consumed
  const membership = await Membership.findOne({
    where: {
      inviteToken: token,
      UserId: null,
    },
  });
  if (!membership) {
    throw new Error('No invitation id');
  }

  const { id, inviteName, inviteEmail } = membership.toJSON<{
    id: number;
    inviteName: string;
    inviteEmail: string;
  }>();

  // TODO allows anyone to accept invitation for existing user if they know the invitation id
  let user = await User.findOne({
    where: {
      email: inviteEmail,
    },
  });
  if (!user) {
    user = await User.create({
      name: inviteName,
      email: inviteEmail,
    });
  }
  const { id: UserId } = user.toJSON<{ id: number }>();

  await Membership.update(
      {
        UserId,
      },
      {
        where: {
          id,
        },
      }
  );
};

const getMemberships = async (
    email: string
): Promise<{ id: number; name: string; role: string }[]> => {
  const user = await User.findOne({
    where: {
      email,
    },
  });
  if (!user) {
    throw new Error('No user found');
  }
  const { id: UserId } = user.toJSON<{ id: string }>();
  const memberships = await Membership.findAll({
    where: {
      UserId,
    },
    include: [
      {
        model: Organization,
      },
      {
        model: User,
      },
    ],
  });
  return memberships.map((membership) => {
    const {
      Organization: { id, name },
      role,
    } = membership.toJSON();
    return {
      id,
      name,
      role
    }
  });
};

const listProjects = async (OrganizationId: number) => {
  const projects = await Project.findAll({
    where: {
      OrganizationId,
    }
  });
  return projects.map((project) => project.toJSON());
}

const createProject = async (OrganizationId: number, name: string) => {
  const project = await Project.create({
    OrganizationId,
    name
  });
  return project.toJSON();
}

const setup = async () => {
  await sequelize.sync({ force: true });

  const admin = await User.create({
    name: 'Matt Laurie',
    email: 'mdlaurie+admin@gmail.com',
    role: 'SUPERADMIN',
  });
  const { id: AdminUserId } = admin.toJSON<{ id: number }>();

  const user = await User.create({
    name: 'Matt Laurie',
    email: 'mdlaurie+customer@gmail.com',
    role: 'CUSTOMER',
  });
  const { id: CustomerUserId } = user.toJSON<{ id: number }>();
  const org = await Organization.create({
    name: 'Matt Laurie Org',
  });
  const { id: CustomerOrgId } = org.toJSON<{ id: number }>();
  await Membership.create({
    OrganizationId: CustomerOrgId,
    UserId: CustomerUserId,
    InvitedByUserId: AdminUserId,
    role: 'OWNER',
  });
  await Project.create({
    OrganizationId: CustomerOrgId,
    name: 'Default Project',
  });

  await signup('Blah Blah', 'blah@example.com');
  const { email, inviteToken } = await invite(
      CustomerOrgId,
      CustomerUserId,
      'Blah Blah',
      'blah@example.com'
  );
  console.log(`email invitation ${inviteToken} to ${email}`);

  await accept(inviteToken);

  const memberships = await getMemberships(email);
  console.log(memberships);

  const project = await createProject(memberships[0].id, 'blah project');

  const projects = await listProjects(memberships[0].id);
  console.log(projects);

};

(async () => {
  await setup();
  process.exit(0);
})();
