import db from "../database/index.js";
import User from "./user.js";

const Conversation = db.define("conversation", {
	id: {
		type: db.Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	user_id: {
		type: db.Sequelize.DataTypes.UUID,
		allowNull: false,
	},
	partner_id: {
		type: db.Sequelize.DataTypes.UUID,
		allowNull: false,
	},
});

Conversation.belongsTo(User, {
	foreignKey: "user_id",
	as: "user",
});

export default Conversation;
