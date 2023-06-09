import express from "express";
import API from "./routes/API.js";
import web from "./routes/web.js";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import db from "./database/index.js";
import { dropAll, models } from "./models/index.js";
import seed from "./utils/seeders.js";
import formidable from "./middlewares/formidable.js";
import cors from "cors";

dotenv.config();
const port = process.env.PORT || 3000;

const app = express();

app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"],
	})
);

app.use(express.static("src/build"));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

try {
	console.log("Connecting to database...");
	await db.sync();

	console.log("Database connected");
} catch (err) {
	console.log(`Error: ${err}`);
}

app.use("/api", API);
app.use("/", web);

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
