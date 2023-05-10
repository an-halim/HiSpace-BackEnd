import db from "../database/index.js";
import location from "./location.js";

const menu = db.define("menu", {
  menuId: {
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
  }, 
  price: {
    type: db.Sequelize.FLOAT,
    allowNull: false,
  }

}, {
  freezeTableName: true,
})

menu.belongsTo(location);
location.hasMany(menu);

export default menu;