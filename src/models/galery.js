import db from "../database/index.js";


const galery = db.define("galery", {
  galeryId: {
    type: db.Sequelize.UUID,
    defaultValue: db.Sequelize.UUIDV4,
    primaryKey: true,
  },
  locationId: {
    type: db.Sequelize.UUID,
    allowNull: false,
  },
  imageUrl: {
    type: db.Sequelize.STRING,
    allowNull: false,
  }

}, {
  freezeTableName: true,
})

export default galery;