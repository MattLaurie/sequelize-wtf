import 'dotenv/config';
import {DataTypes, Sequelize} from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DATABASE_HOSTNAME,
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
});

const Shipment = sequelize.define('Shipment', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
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
        autoIncrement: true,
        primaryKey: true,
    },
    ShipmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Shipments',
            key: 'id'
        }
    },
    params: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('ENQUEUED', 'TRACKING', 'CANCELLED', 'COMPLETED'),
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

const TrackingEvent = sequelize.define('TrackingEvent', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    ShipmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Shipments',
            key: 'id'
        }
    },
    TrackingRequestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'TrackingRequests',
            key: 'id'
        }
    },
    TrackingProviderEventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'TrackingProviderEvents',
            key: 'id'
        }
    },
    event: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('ENQUEUED', 'PROCESSED'),
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
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
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

const TrackingProviderService = sequelize.define('TrackingProviderService', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    TrackingProviderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'TrackingProviders',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    kind: {
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

const TrackingProviderRequest = sequelize.define('TrackingProviderRequest', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    TrackingRequestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'TrackingRequests',
            key: 'id'
        }
    },
    TrackingProviderServiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'TrackingProviderServices',
            key: 'id'
        }
    },
    params: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('ENQUEUED', 'TRACKING', 'CANCELLED', 'COMPLETED'),
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
        autoIncrement: true,
        primaryKey: true,
    },
    TrackingProviderRequestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'TrackingProviderRequests',
            key: 'id'
        }
    },
    event: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('ENQUEUED', 'PROCESSED'),
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
Shipment.hasMany(TrackingEvent);

TrackingRequest.belongsTo(Shipment, {
    foreignKey: {
        allowNull: false,
    }
});
TrackingRequest.hasMany(TrackingEvent);
TrackingRequest.hasMany(TrackingProviderRequest);

TrackingEvent.belongsTo(Shipment);
TrackingEvent.belongsTo(TrackingRequest);
TrackingEvent.belongsTo(TrackingProviderEvent);

TrackingProvider.hasMany(TrackingProviderService);

TrackingProviderService.belongsTo(TrackingProvider);

TrackingProviderRequest.belongsTo(TrackingProviderService);
TrackingProviderRequest.hasMany(TrackingProviderEvent);
TrackingProviderRequest.belongsTo(TrackingRequest);

TrackingProviderEvent.belongsTo(TrackingProviderRequest);
TrackingProviderEvent.hasMany(TrackingEvent);

const setup = async () => {
    await sequelize.sync({force: true});
}

(async () => {
    await setup();
    process.exit(0);
})();
