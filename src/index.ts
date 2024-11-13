import 'dotenv/config';
import {DataTypes, Sequelize} from 'sequelize';

const setup = async () => {
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
            primaryKey: true,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: sequelize.fn('NOW'),
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: sequelize.fn('NOW'),
        },
    });

    await sequelize.sync({force: true});

    const models = await Thing.findAll({});
}

(async () => {
    await setup();
    process.exit(0);
})();