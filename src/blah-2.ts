import 'dotenv/config';
import {DataTypes, Sequelize} from 'sequelize';
import {z, ZodError} from 'zod';
import {fromZodError} from 'zod-validation-error';

enum TrackingType {
    OCEAN_CONTAINER = 'OCEAN_CONTAINER',
    OCEAN_CARGO = 'OCEAN_CARGO'
}

abstract class RemoteTrackingService {

    abstract register(params: any): Promise<{
        result: any;
        reference: string;
        status: 'ENQUEUED' | 'TRACKING' | 'FAILED'
    }>;

    abstract fetch(reference: string, params: any): Promise<{
        result: any;
        status: 'ENQUEUED' | 'PROCESSED' | 'FAILED'
    }>;
}

export type Constructor<T> = new (...args: any[]) => T;

const SERVICE_LOOKUP = new Map<string, Constructor<RemoteTrackingService>>();

function Service<T extends RemoteTrackingService>(kind: string): (target: Constructor<T>) => void {
    return function (target: Constructor<T>): void {
        SERVICE_LOOKUP.set(kind, target);
    }
}

@Service('Debug.OCEAN_CONTAINER.v1')
class DebugService extends RemoteTrackingService {

    async register(params: any): Promise<{
        result: any;
        reference: string;
        status: 'ENQUEUED' | 'TRACKING' | 'FAILED'
    }> {
        try {
            const schema = z.object({
                mblNumber: z.string(),
                containerNumber: z.string()
            });
            const {mblNumber, containerNumber} = schema.parse(params);
            return {
                result: {},
                reference: 'abc123',
                status: 'TRACKING',
            }
        } catch (error) {
            if (error instanceof ZodError) {
                const validationError = fromZodError(error);
                throw new Error(validationError.toString());
            }
            throw error;
        }
    }

    async fetch(reference: string, params: any): Promise<{ result: any; status: 'ENQUEUED' | 'PROCESSED' | 'FAILED' }> {
        try {
            if (reference === 'abc123') {
                return {
                    result: {
                        something: true
                    },
                    status: 'ENQUEUED'
                }
            }
            return {
                result: null,
                status: 'FAILED'
            }
        } catch (error) {
            throw error;
        }
    }
}

@Service('Error.OCEAN_CONTAINER.v1')
class ErrorService extends RemoteTrackingService {

    async register(params: any): Promise<{
        result: any;
        reference: string;
        status: 'ENQUEUED' | 'TRACKING' | 'FAILED'
    }> {
        throw new Error('register error');
    }

    async fetch(reference: string, params: any): Promise<{ result: any; status: 'ENQUEUED' | 'PROCESSED' | 'FAILED' }> {
        throw new Error('fetch error');
    }
}

const setup = async () => {
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
            primaryKey: true,
            autoIncrement: true,
        },
        shipmentType: {
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

    const Container = sequelize.define('Container', {
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
                model: 'Shipment',
                key: 'id',
            }
        },
        mblNumber: {
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

    const Equipment = sequelize.define('Equipment', {
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
                model: 'Shipment',
                key: 'id',
            }
        },
        mblNumber: {
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
                key: 'id'
            }
        },
        params: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('ENQUEUED', 'TRACKING', 'FAILED'),
            allowNull: false
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
    })

    const ProviderService = sequelize.define('ProviderService', {
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
        kind: {
            type: DataTypes.STRING
        },
        params: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('ENABLED', 'DISABLED'),
            allowNull: false
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
    }, {
        indexes: []
    });

    const ProviderServiceRequest = sequelize.define('ProviderServiceRequest', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        ProviderServiceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ProviderServices',
                key: 'id',
            }
        },
        params: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        result: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        reference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('ENQUEUED', 'TRACKING', 'FAILED'),
            allowNull: false
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
    }, {
        indexes: []
    });

    const ProviderServiceEvent = sequelize.define('ProviderServiceEvent', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        ProviderServiceRequestId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ProviderServiceRequests',
                key: 'id',
            }
        },
        result: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('ENQUEUED', 'PROCESSED', 'FAILED'),
            allowNull: false
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
    }, {
        indexes: []
    });

    Shipment.hasMany(TrackingRequest);
    TrackingRequest.belongsTo(Shipment);

    Shipment.hasMany(Equipment);
    Equipment.belongsTo(Shipment);

    Shipment.hasMany(Container);
    Container.belongsTo(Shipment);

    ProviderService.hasMany(ProviderServiceRequest);
    ProviderServiceRequest.belongsTo(ProviderService);

    ProviderServiceRequest.hasMany(ProviderServiceEvent);
    ProviderServiceEvent.belongsTo(ProviderServiceRequest);

    await sequelize.sync({force: true});

    const debugServiceModel = await ProviderService.create({
        type: 'OCEAN_CONTAINER',
        kind: 'Debug.OCEAN_CONTAINER.v1',
        params: {},
        status: 'ENABLED'
    });
    const {id: DebugProviderServiceId} = debugServiceModel.toJSON<{ id: number }>();

    const somethingServiceModel = await ProviderService.create({
        type: 'OCEAN_CARGO',
        kind: 'Something.OCEAN_CONTAINER.v1',
        params: {},
        status: 'ENABLED'
    });
    const {id: SomethingProviderServiceId} = somethingServiceModel.toJSON<{ id: number }>();

    const errorServiceModel = await ProviderService.create({
        type: 'OCEAN_CONTAINER',
        kind: 'Error.OCEAN_CONTAINER.v1',
        params: {},
        status: 'ENABLED'
    });
    const {id: ErrorProviderService} = errorServiceModel.toJSON<{ id: number }>();

    // --


    // --

    // await Promise.allSettled([
    //     ProviderServiceRequest.create({
    //         ProviderServiceId: DebugProviderServiceId,
    //         params: {
    //             mblNumber: 'ABC1234',
    //             containerNumber: 'ABCU1234567',
    //         },
    //         status: 'ENQUEUED'
    //     }),
    //     ProviderServiceRequest.create({
    //         ProviderServiceId: DebugProviderServiceId,
    //         params: {
    //             // Missing required mblNumber
    //             containerNumber: 'ABCU1234567',
    //         },
    //         status: 'ENQUEUED'
    //     }),
    //     ProviderServiceRequest.create({
    //         // Unimplemented provider service
    //         ProviderServiceId: SomethingProviderServiceId,
    //         params: {
    //             mblNumber: 'ABC1234',
    //             containerNumber: 'ABCU1234567',
    //         },
    //         status: 'ENQUEUED'
    //     }),
    // ])

    const track = async (ShipmentId: number, params: any) => {
        const transaction = await sequelize.transaction();
        try {
            const shipmentModel = await Shipment.findByPk(ShipmentId, {
                include: [
                    {
                        model: Container
                    },
                    {
                        model: Equipment
                    }
                ]
            });
            if (!shipmentModel) {
                console.log('No shipment found');
                // TODO this sucks
                await TrackingRequest.create({
                    ShipmentId,
                    params,
                    status: 'FAILED'
                }, {
                    transaction
                });
                await transaction.commit();
                return;
            }
            const {shipmentType, mblNumber} = shipmentModel.toJSON<{ id: number; shipmentType: string; mblNumber: string }>();

            const trackingRequestModel = await TrackingRequest.create({
                ShipmentId,
                params,
                status: 'TRACKING'
            }, {
                transaction
            });
            const {id: TrackingRequestId} = trackingRequestModel.toJSON<{ id: number }>();

            const reqParams = {
                ...params
            }

            const types: TrackingType[] = [];
            switch (shipmentType) {
                case 'FCL':
                    types.push(TrackingType.OCEAN_CONTAINER);
                    reqParams.mblNumber = mblNumber;
                    break;
            }

            if (types.length === 0) {
                console.log('No tracking types found');
                // TODO this sucks
                await TrackingRequest.create({
                    ShipmentId,
                    params,
                    status: 'FAILED'
                }, {
                    transaction
                });
                await transaction.commit();
                return;
            }

            for (const type of types) {
                console.log(`Found type: ${type}`);
                const providerServiceModels = await ProviderService.findAll({
                    where: {
                        type
                    },
                    transaction
                });
                for (const providerServiceModel of providerServiceModels) {
                    const {id: ProviderServiceId} = providerServiceModel.toJSON<{ id: number }>();
                    await ProviderServiceRequest.create({
                        ProviderServiceId,
                        params,
                        status: 'ENQUEUED'
                    }, {
                        transaction
                    });
                }
            }
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }

    const register = async () => {
        const transaction = await sequelize.transaction();

        try {
            const models = await ProviderServiceRequest.findAll({
                where: {
                    status: 'ENQUEUED'
                },
                include: [
                    {
                        model: ProviderService,
                    }
                ],
                lock: true,
                skipLocked: true,
                limit: 10,
                order: [['id', 'ASC']], // TODO do better
                transaction
            });

            for (const model of models) {
                const blah = model.toJSON<{
                    id: number;
                    ServiceId: string;
                    params: any;
                    status: 'ENQUEUED' | 'TRACKING';
                    reference: string;
                    ProviderService: {
                        id: number;
                        type: string;
                        kind: string;
                        params: any;
                        status: 'ENABLED';
                    }
                }>();
                console.log('ProviderServiceRequest', blah);

                const constructor = SERVICE_LOOKUP.get(blah.ProviderService.kind);
                if (!constructor) {
                    await ProviderServiceRequest.update({
                        status: 'FAILED'
                    }, {
                        where: {
                            id: blah.id
                        },
                        transaction
                    })
                    continue;
                }
                const svc = new constructor();

                const params = {
                    ...blah.ProviderService.params,
                    ...blah.params,
                }
                try {
                    const {result, reference, status} = await svc.register(params);
                    await ProviderServiceRequest.update({
                        result,
                        reference,
                        status
                    }, {
                        where: {
                            id: blah.id
                        },
                        transaction
                    })
                } catch (error) {
                    console.log(error);
                    await ProviderServiceRequest.update({
                        status: 'FAILED'
                    }, {
                        where: {
                            id: blah.id
                        },
                        transaction
                    })
                }
            }
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }

    const fetch = async () => {
        const transaction = await sequelize.transaction();

        try {
            const models = await ProviderServiceRequest.findAll({
                where: {
                    status: 'TRACKING'
                },
                include: [
                    {
                        model: ProviderService,
                    }
                ],
                lock: true,
                skipLocked: true,
                limit: 10,
                order: [['id', 'ASC']],
                transaction
            });

            for (const model of models) {
                const blah = model.toJSON<{
                    id: number;
                    ServiceId: string;
                    params: any;
                    status: 'ENQUEUED' | 'TRACKING';
                    reference: string;
                    ProviderService: {
                        id: number;
                        type: string;
                        kind: string;
                        params: any;
                        status: 'ENABLED';
                    }
                }>();
                console.log('ProviderServiceRequest', {
                    blah
                });

                const svc = new DebugService();
                const params = {
                    ...blah.ProviderService.params,
                    ...blah.params,
                }
                try {
                    const {result, status} = await svc.fetch(blah.reference, params);
                    await ProviderServiceEvent.create({
                        ProviderServiceRequestId: blah.id,
                        result,
                        status
                    }, {
                        transaction
                    })
                } catch (error) {
                    console.log(error);
                    await ProviderServiceEvent.create({
                        ProviderServiceRequestId: blah.id,
                        status: 'FAILED'
                    }, {
                        transaction
                    })
                }
            }
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }

    console.log('SERVICE_LOOKUP', {
        SERVICE_LOOKUP
    });

    const shipmentModel = await Shipment.create({
        shipmentType: 'FCL'
    });
    const {id: ShipmentId} = shipmentModel.toJSON<{ id: number }>();
    console.log('SHIPMENT', {
        ShipmentId
    })

    await track(ShipmentId, {
        mblNumber: 'ABC123',
        containerNumber: 'ABCU1234567'
    });
    await register();
    await fetch();

    // console.log('trackingrequests');
    // const trackingRequests = await TrackingRequest.findAll({
    // });
    // trackingRequests.forEach((b) => {
    //     console.log('trackingRequest', b.toJSON());
    // })
    //
    // console.log('requests');
    // const requests = await ProviderServiceRequest.findAll({
    //     include: [
    //         {
    //             model: ProviderService
    //         }
    //     ]
    // });
    // requests.forEach((b) => {
    //     console.log('request', b.toJSON());
    // })
    //
    // console.log('events');
    // const events = await ProviderServiceEvent.findAll({
    //     include: [
    //         {
    //             model: ProviderServiceRequest
    //         }
    //     ]
    // });
    // events.forEach((b) => {
    //     console.log('event', b.toJSON());
    // })
}

(async () => {
    await setup();
    process.exit(0);
})();
