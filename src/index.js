import express from "express";
import router from "./routes/index.js";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import db from "./database/index.js";
import models from "./models/index.js";

dotenv.config();
const port = process.env.PORT || 3000;

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

try {
	await db.authenticate({
		logging: false,
	});
	await models();
	console.log("Database connected");
} catch (err) {
	console.log(`Error: ${err}`);
}
app.get("/", (req, res) => res.json({ message: "HiSpace API" }));
app.use("/api", router);

app.use(function (err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = process.env.APP_ENV === "development" ? err : {};

	res.status(err.status || 500);
	res.json({
		status: "failed",
		message: err.message,
	});
});

app.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
