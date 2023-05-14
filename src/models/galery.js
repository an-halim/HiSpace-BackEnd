import db from "../database/index.js";
import location from "./location.js";


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

galery.belongsTo(location, {
  foreignKey: "locationId",
  as: "location",
});
location.hasMany(galery);

export default galery;