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

const Shipment = sequelize.define('Shipment', {
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

// --

const TrackingRequest = sequelize.define('TrackingRequest', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  ShipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Shipments',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('ENQUEUED', 'TRACKING', 'CANCELLED', 'COMPLETED', 'FAILED'),
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

const TrackingEvents = sequelize.define('TrackingEvent', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  TrackingRequestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TrackingRequests',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('ENQUEUED', 'TRACKING', 'CANCELLED', 'COMPLETED', 'FAILED'),
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

const TrackingProvider = sequelize.define('TrackingProvider', {
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

const TrackingProviderService = sequelize.define('TrackingProviderService', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  TrackingProviderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TrackingProviders',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  kind: {
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

const TrackingProviderRequest = sequelize.define('TrackingProviderRequest', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  TrackingProviderServiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TrackingProviderServices',
      key: 'id',
    },
  },
  TrackingRequestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TrackingRequests',
      key: 'id',
    },
  },
  params: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: 'unique_reference',
  },
  status: {
    type: DataTypes.ENUM('ENQUEUED', 'TRACKING', 'CANCELLED', 'COMPLETED', 'FAILED'),
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

const TrackingProviderEvent = sequelize.define('TrackingProviderEvent', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  TrackingProviderRequestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TrackingProviderRequests',
      key: 'id',
    },
  },
  event: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('ENQUEUED', 'PROCESSED', 'FAILED'),
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

Shipment.hasMany(TrackingRequest);
TrackingRequest.belongsTo(Shipment);

TrackingRequest.hasMany(TrackingEvents);
TrackingEvents.belongsTo(TrackingRequest);

TrackingRequest.hasMany(TrackingProviderRequest);
TrackingProviderRequest.belongsTo(TrackingRequest);

TrackingProvider.hasMany(TrackingProviderService);
TrackingProviderService.belongsTo(TrackingProvider);

TrackingProviderService.hasMany(TrackingProviderRequest);
TrackingProviderRequest.belongsTo(TrackingProviderService);

TrackingProviderRequest.hasMany(TrackingProviderEvent);
TrackingProviderEvent.belongsTo(TrackingProviderRequest);

export interface TrackingService {
  register(params: any): Promise<{ reference: string }>;

  fetch(): Promise<void>;
}

export type Constructor<T> = new (...args: any[]) => T;

const SERVICE_LOOKUP = new Map<string, Constructor<TrackingService>>();

function Service<T extends TrackingService>(kind: string): (target: Constructor<T>) => void {
  return function (target: Constructor<T>): void {
    SERVICE_LOOKUP.set(kind, target);
  };
}

@Service('Shipsgo.OCEAN_CONTAINER.v1')
class ShipsgoOceanContainerV1 implements TrackingService {
  async register(params: any) {
    console.log('debug shipsgo ocean container v1 register called', {
      params,
    });
    return {
      reference: 'abc123',
    };
  }

  async fetch() {
    console.log('debug shipsgo ocean container v1 fetch called');
  }
}

const setup = async () => {
  await sequelize.sync({ force: true });

  const shipsgo = await TrackingProvider.create({
    name: 'Shipsgo',
  });
  const { id: ShipsgoProviderId } = shipsgo.toJSON<{ id: number }>();

  await Promise.all([
    TrackingProviderService.create({
      TrackingProviderId: ShipsgoProviderId,
      type: 'OCEAN_CONTAINER',
      kind: 'Shipsgo.OCEAN_CONTAINER.v1',
    }),
    TrackingProviderService.create({
      TrackingProviderId: ShipsgoProviderId,
      type: 'AIR_CARGO',
      kind: 'Shipsgo.AIR_CARGO.v1',
    }),
  ]);

  const portcast = await TrackingProvider.create({
    name: 'Portcast',
  });
  const { id: PortcastProviderId } = portcast.toJSON<{ id: number }>();

  await Promise.all([
    TrackingProviderService.create({
      TrackingProviderId: PortcastProviderId,
      type: 'OCEAN_CONTAINER',
      kind: 'Portcast.OCEAN_CONTAINER.v1',
    }),
    TrackingProviderService.create({
      TrackingProviderId: PortcastProviderId,
      type: 'AIR_CARGO',
      kind: 'Portcast.AIR_CARGO.v1',
    }),
  ]);

  const shipment = await Shipment.create({});
  const { id: ShipmentId } = shipment.toJSON<{ id: number }>();

  const request = await TrackingRequest.create({
    ShipmentId,
    status: 'TRACKING',
  });
  const { id: TrackingRequestId } = request.toJSON<{ id: number }>();

  const providerServices = await TrackingProviderService.findAll({
    where: {
      type: 'OCEAN_CONTAINER',
    },
  });
  for (const providerService of providerServices) {
    const {
      id: TrackingProviderServiceId,
      type,
      kind,
    } = providerService.toJSON<{
      id: number;
      type: string;
      kind: string;
    }>();
    // TODO use kind to find impl for service

    const ctor = SERVICE_LOOKUP.get(kind);
    if (!ctor) {
      await TrackingProviderRequest.create({
        TrackingProviderServiceId,
        TrackingRequestId,
        params: {
          error: 'No service found for kind ' + kind,
        },
        status: 'FAILED',
      });
      continue;
    }
    try {
      const svc = new ctor();
      const { reference } = await svc.register({});
      const providerRequest = await TrackingProviderRequest.create({
        TrackingProviderServiceId,
        TrackingRequestId,
        params: {},
        reference,
        status: 'TRACKING',
      });
    } catch (error) {
      console.log(error);
      await TrackingProviderRequest.create({
        TrackingProviderServiceId,
        TrackingRequestId,
        params: {
          error: (error as Error).message,
        },
        status: 'FAILED',
      });
    }
  }
};

(async () => {
  await setup();
  process.exit(0);
})();
