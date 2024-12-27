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

const Carrier = sequelize.define('Carrier', {
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
  smdgCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nmftaCode: {
    // TODO NMFTA provide SCAC
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
})

const Voyage = sequelize.define('Voyage', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  carrierVoyageNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  universalVoyageReference: {
    type: DataTypes.STRING,
  },
  // ServiceId
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

const VesselType = sequelize.define('VesselType', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uneceCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
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

const Vessel = sequelize.define('Vessel', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  imoNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: 'unique_imo_number',
  },
  flag: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  callSign: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // OperatorCarrierId
  isDummy: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  lengthOverall: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // DimensionUnit
  VesselTypeCode: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'VesselTypes',
      key: 'code',
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

const CommercialVoyage = sequelize.define('CommercialVoyage', {
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

const ModeOfTransport = sequelize.define('ModeOfTransport', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
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

const PortCallStatusType = sequelize.define('PortCallStatusType', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
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

const CommercialVoyageTransportCall = sequelize.define('CommercialVoyageTransportCall', {
  CommercialVoyage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CommercialVoyages',
      key: 'id',
    },
  },
  TransportCallId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TransportCalls',
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

const TransportPlanStageType = sequelize.define('TransportPlanStageType', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
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

const Transport = sequelize.define('Transport', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  LoadTransportCallId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TransportCalls',
      key: 'id',
    },
  },
  DischargeTransportCallId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TransportCalls',
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

const TransportCall = sequelize.define('TransportCall', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sequenceNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // FacilityTypeCode
  // LocationId
  CommercialVoyageTransportCallId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CommercialVoyageTransportCalls',
      key: 'id',
    },
  },
  ModeOfTransportCode: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'ModeOfTransports',
      key: 'code',
    },
  },
  VesselId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Vessels',
      key: 'id',
    },
  },
  ImportVoyageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Voyages',
      key: 'id',
    },
  },
  ExportVoyageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Voyages',
      key: 'id',
    },
  },
  PortCallStatusTypeCode: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'PortCallStatusTypes',
      key: 'code',
    },
  },
  portVisitReference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  railCarName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  railServiceReference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  departureId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  licencePlateNumber: {
    // TODO licence vs license
    type: DataTypes.STRING,
    allowNull: true,
  },
  chassisLicencePlateNumber: {
    // TODO licence vs license
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
});

const ShipmentTransport = sequelize.define('ShipmentTransport', {
  ShipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Shipments',
      key: 'id',
    },
  },
  TransportId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Transports',
      key: 'id',
    },
  },
  transportPlanSequenceNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  TransportPlanStageTypeCode: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'TransportPlanStageTypes',
      key: 'code',
    },
  },
  CommercialVoyageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CommercialVoyages',
      key: 'id',
    },
  },
  isUnderShipperResponsibility: {
    type: DataTypes.BOOLEAN,
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

const setup = async () => {
  await sequelize.sync({ force: true });

  await TransportPlanStageType.bulkCreate([
    {
      code: 'PRC',
      name: 'Pre-Carriage',
      description: 'Transport leg occurring prior to the main transport leg.',
    },
    {
      code: 'MNC',
      name: 'Main Carriage Transport',
      description: 'The main transport leg(s), happening on one or more main vessels.',
    },
    {
      code: 'ONC',
      name: 'On-Carriage Transport',
      description: 'The transport leg occuring after the main leg to the final destination.',
    },
  ]);

  await ModeOfTransport.bulkCreate([
    {
      code: '1',
      name: 'Maritime transport',
      description: 'Transport of goods and/or persons is by sea.',
      type: 'VESSEL',
    },
    {
      code: '2',
      name: 'Rail transport',
      description: 'Transport of goods and/or persons is by rail.',
      type: 'RAIL',
    },
    {
      code: '3',
      name: 'Road transport',
      description: 'Transport of goods and/or persons is by road.',
      type: 'TRUCK',
    },
    {
      code: '8',
      name: 'Inland water Transport',
      description: 'Transport of goods and/or persons is by inland water.',
      type: 'BARGE',
    },
    // {
    //   // added from
    //   code: '4',
    //   name: 'Air transport',
    //   description: 'Transport of goods and/or persons is by air.',
    //   type: 'AIRCRAFT',
    // },
  ]);

  await VesselType.bulkCreate([
    {
      code: 'GECA',
      name: 'General Cargo',
      uneceCode: '50',
      description: 'Vessel designed to carry general cargo.',
    },
    {
      code: 'CONT',
      name: 'Container',
      uneceCode: '511',
      description: 'Vessel designed to carry containers only.',
    },
    {
      code: 'RORO',
      name: 'RoRo',
      uneceCode: '512',
      description: 'Vessel with ramp designed to carry roll-on/roll-off cargo.',
    },
    {
      code: 'CARC',
      name: 'Car carrier',
      uneceCode: '513',
      description: 'Vessel designed to carry automotive vehicles.',
    },
    {
      code: 'PASS',
      name: 'Passenger',
      uneceCode: '59',
      description: 'Vessel designed to carry more than 12 passengers.',
    },
    {
      code: 'FERY',
      name: 'Ferry',
      uneceCode: '592',
      description: 'Vessel designed to ply regularly between two or more port.',
    },
    {
      code: 'BULK',
      name: 'Bulk',
      uneceCode: '52',
      description: 'Vessel designed to carry bulk cargo.',
    },
    {
      code: 'TANK',
      name: 'Tanker',
      uneceCode: '53',
      description: 'Vessel solely equipped with tanks to carry cargo.',
    },
    {
      code: 'LPGT',
      name: 'Liquified gaz tanker',
      uneceCode: '54',
      description: 'Tanker designed to carry liquefied gas.',
    },
    {
      code: 'ASSI',
      name: 'Assistance',
      uneceCode: '60',
      description: 'Vessel designed to give assistance such as tug.',
    },
    {
      code: 'PLOT',
      name: 'Pilot boat',
      uneceCode: '711',
      description: 'Vessel designed to convey pilots to/from ships.',
    },
  ]);

  await PortCallStatusType.bulkCreate([
    {
      code: 'OMIT',
      name: 'Omit',
      description:
        'When a ship does not call at a port included in the Long Term Schedule that was planned at the start of the voyage.',
    },
    {
      code: 'BLNK',
      name: 'Blank',
      description:
        'When an already announced voyage is cancelled. In this case the voyage number is retained and planned port calls are blanked.',
    },
    {
      code: 'ADHO',
      name: 'Ad Hoc',
      description:
        'An additional port call made on a specific voyage that was not originally included in the Long Term Schedule.',
    },
    {
      code: 'PHOT',
      name: 'Phase Out',
      description:
        'When a vessel moves out of a service at a given port from the latest issued schedule with vessel partners.',
    },
    {
      code: 'PHIN',
      name: 'Phase In',
      description:
        'When a vessel moves into a service at a given port from the lates issues schedule with vessel partners.',
    },
    {
      code: 'ROTC',
      name: 'Rotation Change',
      description: 'When the sequence of port calls is changed compared to the proforma.',
    },
    {
      code: 'SLID',
      name: 'Sliding',
      description:
        'When a vessel takes another position than planned in a service (i.e. due to relevant delay) resulting in one or more voyages to be cancelled or blanked.',
    },
    {
      code: 'CUTR',
      name: 'Cut and Run',
      description:
        'When the vessel will not complete all planned moves for the specific port call, but leave cargo- moves behind (discharge / or load- both possible) in order to safeguard sailing deadline from the port of call.',
    },
  ]);
};

(async () => {
  await setup();
  process.exit(0);
})();
