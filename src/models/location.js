import db from "../database/index.js";


const location = db.define("location", {
  locationId: {
    type: db.Sequelize.UUID,
    defaultValue: db.Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  address: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  longitude: {
    type: db.Sequelize.FLOAT,
    allowNull: false,
  },
  latitude: {
    type: db.Sequelize.FLOAT,
    allowNull: false,
  },
  owner: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  galeryId: {
    type: db.Sequelize.UUID,
    allowNull: false,
  },
  description: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  time: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  rating: {
    type: db.Sequelize.FLOAT,
    allowNull: true,
  }
}, {
  freezeTableName: true,
})

export default location;