import db from "../database/index.js";
import user from "./user.js";
import location from "./location.js";

const wishList = db.define(
	"wishList",
	{
		id: {
			type: db.Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		locationId: {
			type: db.Sequelize.UUID,
			allowNull: false,
		},
	},
	{
		freezeTableName: true,
	}
);

wishList.belongsTo(user);
user.hasMany(wishList);

wishList.belongsTo(location);
location.hasMany(wishList);

export default wishList;
