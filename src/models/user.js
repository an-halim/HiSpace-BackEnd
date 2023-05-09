import db from "../database/index.js";
import { DataTypes } from "sequelize";

const user = db.define(
	"user",
	{
		userId: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		fullName: {
			type: db.Sequelize.STRING,
			allowNull: false,
		},
		password: {
			type: db.Sequelize.STRING,
			allowNull: false,
		},
		email: {
			type: db.Sequelize.STRING,
      allowNull: false,
      unique: true,
		},
		profilePic: {
			type: db.Sequelize.STRING,
			allowNull: true,
		},
		tempPassword: {
			type: db.Sequelize.STRING,
			allowNull: true,
		},
	},
	{
		freezeTableName: true,
	}
);

export default user;
