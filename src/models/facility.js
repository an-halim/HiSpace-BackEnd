import db from "../database/index.js";

const facility = db.define("facility", {
  facilityId: {
    type: db.Sequelize.UUID,
    defaultValue: db.Sequelize.UUIDV4,
    primaryKey: true,
  },
  locationId: {
    type: db.Sequelize.UUID,
    allowNull: false,
  },
  name: {
    type: db.Sequelize.STRING,
    allowNull: false,
  }

}, {
  freezeTableName: true,
})

export default facility;