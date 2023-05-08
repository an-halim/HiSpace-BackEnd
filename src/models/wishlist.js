import db from "../database/index.js";
import user from "./user.js";

const wishList = db.define("wishList", {
  id: {
    type: db.Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  locationId: {
    type: db.Sequelize.INTEGER,
    allowNull: false,
  },
}, {
  freezeTableName: true,
});


wishList.belongsTo(user);
user.hasMany(wishList);

export default wishList;