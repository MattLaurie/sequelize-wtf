import 'dotenv/config';
import { DataTypes, Sequelize } from 'sequelize';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DATABASE_HOSTNAME,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : undefined,
});

const WorkRequest = sequelize.define('WorkRequest', {
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
    type: DataTypes.STRING,
    allowNull: false,
  },
  input: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  output: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('ENQUEUED', 'COMPLETED', 'FAILED'),
    allowNull: false,
  },
  retryCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  maxRetryCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2,
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

enum WorkStatus {
  ENQUEUED = 'ENQUEUED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

abstract class BaseCommand<P extends any, R extends any> {
  constructor(
    private readonly type: string,
    private readonly kind: string
  ) {}

  abstract params(input: any): P;

  abstract execute(params: P): Promise<{ output: R; status: WorkStatus }>;

  async enqueue(input: any): Promise<{ id: number }> {
    try {
      const params = this.params(input);
      const request = await WorkRequest.create({
        type: this.type,
        kind: this.kind,
        input: params,
        status: WorkStatus.ENQUEUED,
      });
      const { id } = request.toJSON<{
        id: number;
      }>();
      return {
        id,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`ExecuteError ${validationError.toString()}`);
      }
      throw error;
    }
  }

  async process(input: any): Promise<{ output: R; status: WorkStatus }> {
    try {
      const params = this.params(input);
      return this.execute(params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`ExecuteError ${validationError.toString()}`);
      }
      throw error;
    }
  }
}

type BlahParams = {
  name: string;
};

class Blah extends BaseCommand<BlahParams, string> {
  constructor() {
    super('blah', 'blah.v1');
  }

  params(input: any): BlahParams {
    const schema = z.object({
      name: z.string(),
    }) satisfies z.ZodType<BlahParams>;
    return schema.parse(input);
  }

  async execute(params: BlahParams): Promise<{ output: string; status: WorkStatus }> {
    const { name } = params;
    return {
      output: `Hello ${name}`,
      status: WorkStatus.COMPLETED,
    };
  }
}

function lookup(kind: string): BaseCommand<any, any> | null {
  // TODO this sucks
  switch (kind) {
    case 'blah.v1':
      return new Blah();
  }
  return null;
}

async function execute(
  type: string,
  kind: string,
  input: any
): Promise<{
  status: WorkStatus;
  output: any;
}> {
  try {
    const cmd = lookup(kind);
    if (!cmd) {
      throw new Error('Unknown command: ' + type);
    }
    const { status: newStatus, output } = await cmd.process(input);
    return {
      status: newStatus,
      output,
    };
  } catch (error) {
    return {
      status: WorkStatus.FAILED,
      output: {},
    };
  }
}

const setup = async () => {
  await sequelize.sync({ force: true });

  try {
    await new Blah().enqueue({
      name: 'hello',
    });
  } catch (error) {
    console.log(error);
  }

  for (let i = 0; i < 3; i++) {
    console.log(`### iteration #${i + 1}`);
    const transaction = await sequelize.transaction();
    try {
      const requests = await WorkRequest.findAll({
        where: {
          status: 'ENQUEUED',
        },
        lock: true,
        skipLocked: true,
        transaction,
      });
      for (const request of requests) {
        const { id, type, kind, input, status, retryCount, maxRetryCount } = request.toJSON<{
          id: number;
          type: string;
          kind: string;
          input: any;
          status: string;
          retryCount: number;
          maxRetryCount: number;
        }>();

        console.log('Executing', {
          id,
          type,
          kind,
          status,
          retryCount,
          maxRetryCount,
        });

        let { status: newStatus, output } = await execute(type, kind, input);

        let newRetryCount = retryCount;
        if (newStatus === WorkStatus.FAILED) {
          newRetryCount += 1;
          if (newRetryCount < maxRetryCount) {
            newStatus = WorkStatus.ENQUEUED; // TODO should have separate state due to deadlocking front of the queue?
          }
        }

        console.log('Result', {
          id,
          type,
          status,
          newStatus,
        });

        await WorkRequest.update(
          {
            status: newStatus,
            retryCount: newRetryCount,
            output,
          },
          {
            where: {
              id,
            },
            transaction,
          }
        );
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
    }
  }
};

(async () => {
  await setup();
  process.exit(0);
})();
