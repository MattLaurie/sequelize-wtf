// import 'dotenv/config';
// import {DataTypes, Sequelize} from 'sequelize';
// import {createId} from '@paralleldrive/cuid2';
// import axios from 'axios';
// import {z} from 'zod';
//
// export interface Worker {
//
//     execute(input: any): Promise<{ status: 'COMPLETED' | 'FAILED'; result: any }>;
// }
//
// export type Constructor<T> = new (...args: any[]) => T;
//
// const SERVICE_LOOKUP = new Map<string, Constructor<Worker>>();
//
// function Register<T extends Worker>(type: string): (target: Constructor<T>) => void {
//     return function (target: Constructor<T>): void {
//         SERVICE_LOOKUP.set(type, target);
//     }
// }
//
// function construct(type: string): Worker | null {
//     const ctor = SERVICE_LOOKUP.get(type);
//     if (!ctor) {
//         return null;
//     }
//     return new ctor();
// }
//
// const sequelize = new Sequelize({
//     dialect: 'mysql',
//     host: process.env.DATABASE_HOSTNAME,
//     database: process.env.DATABASE_NAME,
//     username: process.env.DATABASE_USERNAME,
//     password: process.env.DATABASE_PASSWORD,
// });
//
// const WorkRequest = sequelize.define('WorkRequest', {
//     id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         primaryKey: true,
//         autoIncrement: true,
//     },
//     executionId: {
//         type: DataTypes.STRING,
//         unique: true,
//         defaultValue: createId,
//     },
//     type: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     params: {
//         type: DataTypes.JSON,
//         allowNull: false,
//     },
//     result: {
//         type: DataTypes.JSON,
//         allowNull: true,
//     },
//     status: {
//         type: DataTypes.ENUM('ENQUEUED', 'COMPLETED', 'FAILED'),
//         allowNull: false,
//     },
//     createdAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: sequelize.fn('NOW'),
//     },
//     updatedAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: sequelize.fn('NOW'),
//     }
// });
//
//
// type TriviaWorkParams = {
//     type: 'trivia' | 'math' | 'year';
//     number: number;
// } | {
//     type: 'date';
//     number: string;
// }
//
// type ZodOutputFor<T> = z.ZodType<T, z.ZodTypeDef, unknown>;
//
// const schema = z.discriminatedUnion('type', [
//     z.object({type: z.literal('trivia'), number: z.number()}),
//     z.object({type: z.literal('math'), number: z.number()}),
//     z.object({type: z.literal('date'), number: z.string()}),
//     z.object({type: z.literal('year'), number: z.number()}),
// ]) satisfies ZodOutputFor<TriviaWorkParams>;
//
// type Models = {
//     WorkRequest: typeof WorkRequest
// }
//
// class WorkRequestService {
//     constructor({ })
// }
//
// @Register('Trivia.v1')
// class TriviaWorkService implements Worker {
//
//     async dispatch(params: TriviaWorkParams): Promise<{ id: number; executionId: string }> {
//         const request = await WorkRequest.create({
//             type: 'Trivia.v1',
//             params: params,
//             status: 'ENQUEUED'
//         });
//         const {id, executionId} = request.toJSON<{ id: number; executionId: string }>();
//         return {
//             id,
//             executionId,
//         };
//     }
//
//     async execute(input: any): Promise<{ status: 'COMPLETED' | 'FAILED'; result: any }> {
//         const schema = z.discriminatedUnion('type', [
//             z.object({type: z.literal('trivia'), number: z.number()}),
//             z.object({type: z.literal('math'), number: z.number()}),
//             z.object({type: z.literal('date'), number: z.string()}),
//             z.object({type: z.literal('year'), number: z.number()}),
//         ]) satisfies ZodOutputFor<TriviaWorkParams>;
//         try {
//             const {number, type} = schema.parse(input);
//             const res = await axios.get(`http://numbersapi.com/${number}/${type}`);
//             return {
//                 status: 'COMPLETED',
//                 result: res.data
//             }
//         } catch (error) {
//             return {
//                 status: 'FAILED',
//                 result: null
//             }
//         }
//     }
// }
//
// @Register('Debug.v1')
// class DebugWorkService implements Worker {
//     async execute(params: any): Promise<{ status: 'COMPLETED' | 'FAILED'; result: any }> {
//         try {
//             const res = await axios.get('https://api.chucknorris.io/jokes/random');
//             return {
//                 status: 'COMPLETED',
//                 result: res.data
//             }
//         } catch (error) {
//             return {
//                 status: 'FAILED',
//                 result: null
//             }
//         }
//     }
// }
//
// const poll = async () => {
//     const transaction = await sequelize.transaction();
//     try {
//         const requests = await WorkRequest.findAll({
//             where: {
//                 status: 'ENQUEUED'
//             },
//             transaction,
//             lock: true,
//             skipLocked: true,
//             limit: 5
//         });
//
//         for (const request of requests) {
//             const {id, type, params} = request.toJSON<{ id: number; type: string, params: any }>();
//             const svc = construct(type);
//             if (!svc) {
//                 await WorkRequest.update({
//                     status: 'FAILED'
//                 }, {
//                     where: {
//                         id
//                     },
//                     transaction,
//                 })
//                 continue;
//             }
//             try {
//                 const {status, result} = await svc.execute(params);
//                 await WorkRequest.update({
//                     status,
//                     result
//                 }, {
//                     where: {
//                         id
//                     },
//                     transaction,
//                 })
//             } catch (error) {
//                 await WorkRequest.update({
//                     status: 'FAILED'
//                 }, {
//                     where: {
//                         id
//                     },
//                     transaction,
//                 })
//             }
//         }
//
//         await transaction.commit();
//     } catch (error) {
//         await transaction.rollback();
//     }
// }
//
// const execute = async (type: string, input: any) => {
//     const request = await WorkRequest.create({
//         type: 'Trivia.v1',
//         params: {
//             type: 'date',
//             number: '11/29'
//         },
//         status: 'ENQUEUED'
//     });
//     const {executionId} = request.toJSON<{ id: number; executionId: string }>();
//     return executionId;
// }
//
// const setup = async () => {
//     await sequelize.sync({force: true});
//
//     await WorkRequest.create({
//         type: 'Trivia.v1',
//         params: {
//             type: 'date',
//             number: '11/29'
//         },
//         status: 'ENQUEUED'
//     });
//
//     const id = await execute('Trivia.v1', {
//         type: 'data',
//         number: '11/29'
//     })
//
//     await poll();
//
//     const results = await WorkRequest.findAll()
//     results.forEach((m) => console.log(m.toJSON()))
// }
//
// (async () => {
//     await setup();
//     process.exit(0);
// })();
