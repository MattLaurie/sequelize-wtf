import 'dotenv/config';
import {DataTypes, Sequelize} from 'sequelize';
import {z, ZodError} from 'zod';
import {fromZodError} from 'zod-validation-error';

export enum ThingStatus {
    ENQUEUED = 'ENQUEUED',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    RUNNING = 'RUNNING',
    BLOCKED = 'BLOCKED',
}

type PickEnum<T, K extends T> = {
    [P in keyof T]: P extends K ? P : never;
}

type ThingActionStatus = PickEnum<
    ThingStatus,
    | ThingStatus.COMPLETED
    | ThingStatus.FAILED
>

interface Blah {
    enqueue(type: string, input: any): Promise<{
        id: number;
        executionId: string;
        status: ThingStatus;
    }>;

    process(): Promise<void>;

    action(executionId: string, status: ThingActionStatus, output: any): Promise<{
        id: number;
        status: ThingStatus;
    }>;
}

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DATABASE_HOSTNAME,
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
});

const Thing = sequelize.define('Thing', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    input: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    output: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('ENQUEUED', 'COMPLETED', 'FAILED', 'CANCELLED', 'RUNNING', 'BLOCKED'),
        allowNull: false
    },
    executionId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    retryCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    indexes: [
        {
            fields: ['createdAt'],
        },
        {
            fields: ['type'],
        },
        {
            fields: ['status'],
        },
        {
            fields: ['executionId'],
        }
    ]
});

type Models = {
    Thing: typeof Thing;
}

// interface User {
//     id: number;
//     name: string;
// }
//
// const UserSchema = z.object({
//     id: z.number(),
//     name: z.string()
// }) satisfies z.ZodType<User>;

async function execute(type: string, input: any): Promise<any> {
    try {
        // input -> params
        const schema = z.object({
            name: z.string()
        });
        const params = schema.parse(input);
        // params -> output
        const output = {
            message: `hello ${params.name}`
        }
        return output;
    } catch (error) {
        if (error instanceof ZodError) {
            const validationError = fromZodError(error);
            throw new Error(`ExecuteError ${validationError.toString()}`)
        }
        throw error;
    }
}

class BlahImpl implements Blah {
    constructor(private readonly models: Models) {
    }

    async enqueue(type: string, input: any): Promise<{ id: number; executionId: string; status: ThingStatus }> {
        const model = await this.models.Thing.create({
            type,
            input,
            output: {},
            status: ThingStatus.ENQUEUED,
        });
        const {id, executionId, status} = model.toJSON<{ id: number; executionId: string; status: ThingStatus; }>();
        return {
            id,
            executionId,
            status
        }
    }

    async process(): Promise<void> {
        const transaction = await sequelize.transaction();
        try {
            const models = await this.models.Thing.findAll({
                where: {
                    status: ThingStatus.ENQUEUED
                },
                lock: true,
                skipLocked: true,
                limit: 10,
                order: [['createdAt', 'ASC']],
                transaction
            });

            for (const model of models) {
                const {id, type, input} = model.toJSON<{ id: number; type: string; input: any; }>();
                try {
                    console.log('executing', {
                        type,
                        input
                    })
                    const output = await execute(type, input);
                    await this.models.Thing.update({
                        status: ThingStatus.COMPLETED,
                        output
                    }, {
                        where: {
                            id
                        },
                        transaction
                    })
                } catch (error) {
                    console.log('error', {
                        error
                    })
                    await this.models.Thing.update({
                        status: ThingStatus.FAILED,
                        output: {}
                    }, {
                        where: {
                            id
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

    async action(executionId: string, status: ThingActionStatus, output: any): Promise<{
        id: number;
        status: ThingStatus
    }> {
        const transaction = await sequelize.transaction();
        try {
            let model = await this.models.Thing.findOne({
                where: {
                    executionId,
                    status: ThingStatus.BLOCKED
                },
                transaction
            });
            if (!model) {
                throw new Error('Invalid state');
            }

            const { id } = model.toJSON<{ id: number; }>();

            await this.models.Thing.update({
                status,
                output
            }, {
                where: {
                    id
                },
                transaction
            });
            model = await this.models.Thing.findOne({
                where: {
                    id
                },
                transaction
            });
            if (!model) {
                throw new Error('Not Found')
            }
            await transaction.commit();
            return model.toJSON<{ id: number; status: ThingStatus; }>();    // TODO do better
        } catch (error) {
            console.log(error);
            await transaction.rollback();
            throw new Error('Action error');    // TODO do better
        }
    }
}

const setup = async () => {
    await sequelize.sync({force: true});

    const blah: Blah = new BlahImpl({
        Thing
    });

    await blah.enqueue('DEBUG', {});
    await blah.enqueue('HELLO', {name: 'blah'});
    await blah.enqueue('HELLO', {name: 'bork'});
    await blah.process();

    const models = await Thing.findAll({});
    for (const model of models) {
        console.log(model.toJSON());
    }
}

(async () => {
    await setup();
    process.exit(0);
})();
