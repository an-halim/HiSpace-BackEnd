import db from "../database/index.js";
import randomId from "../utils/randomId.js";
import user from "./user.js";
import wishList from "./wishlist.js";

const location = db.define(
	"location",
	{
		locationId: {
			type: db.Sequelize.UUID,
			defaultValue: () => {
				const random = new randomId(15);
				return random.generate();
			},
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
		ownerEmail: {
			type: db.Sequelize.STRING,
			allowNull: false,
		},
		description: {
			type: db.Sequelize.STRING,
			allowNull: false,
		},
		time: {
			type: db.Sequelize.TEXT("long"),
			allowNull: false,
		},
		rating: {
			type: db.Sequelize.FLOAT,
			allowNull: true,
		},
	},
	{
		freezeTableName: true,
	}
);

location.belongsTo(user);
user.hasMany(location);

export default location;
