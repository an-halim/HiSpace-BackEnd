import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const {
	DB_HOST,
	DB_USERNAME,
	DB_PASSWORD,
	DB_NAME,
	DB_DIALECT,
	DB_PORT,
	APP_ENV,
} = process.env;

const db = process.env.DB_URL
	? new Sequelize(process.env.DB_URL, {
			logging: APP_ENV === "development" ? console.log : false,
	  })
	: new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
			host: DB_HOST,
			dialect: DB_DIALECT,
			port: DB_PORT,
			logging: APP_ENV === "development" ? console.log : false,
	  });

export default db;
