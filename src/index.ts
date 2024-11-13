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

    const ThingFields = sequelize.define('ThingFields', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        ThingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Things',
                key: 'id',
            }
        },
        fields: {
            type: DataTypes.JSON,
            allowNull: false
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

    Thing.hasMany(ThingFields);
    ThingFields.belongsTo(Thing);

    await sequelize.sync({force: true});

    const models = await Thing.findAll({
        include: [
            {
                model: ThingFields,
                attributes: ['id', 'fields'],
                where: {
                    'fields.brand': 'spt'
                },
            }
        ],
        order: [
            [
                sequelize.fn(
                    'JSON_UNQUOTE',
                    sequelize.fn(
                        'JSON_EXTRACT',
                        sequelize.col('ThingFields.fields'),
                        sequelize.literal('\'$.\\"brand\\"\'')
                    )
                ),
                'DESC'
            ]
            // [
            //     sequelize.literal('JSON_UNQUOTE(JSON_EXTRACT(`ThingFields`.`fields`, \'$."brand"\'))'),
            //     'DESC'
            // ]
        ]
    });
}

(async () => {
    await setup();
    process.exit(0);
})();