import express from "express";
import {
	userController as user,
	locationController as location,
} from "../controllers/index.js";
import authorize from "../middlewares/authorize.js";
import formidable from "../middlewares/formidable.js";

const router = express.Router();

// user
router.post("/signup", user.regist);
router.post("/login", user.login);
router.post("/reset-password", user.forgot);
router.post("/reset-password/:token", user.upadatePassword);
router.post("/verify-token/:token", user.verifyToken);
router.get("/me", authorize, user.detail);
router.put("/me", authorize, formidable, user.updateDetail);

// location
router.post("/location", authorize, formidable, location.createLocation);
router.get("/location", location.getAllLocation);
router.get("/location/:locationId", location.getLocationById);



// handle invalid route
router.all("*", (req, res) => {
	res.status(404).json({
		status: "failed",
		message: `Can't find ${req.originalUrl} on this server!, please read the documentation`,
	});
});

export default router;
