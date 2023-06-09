import express from "express";
import {
	userController as user,
	locationController as location,
	reviewController as review,
	wishListController as wishList
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
router.post("/user/wishlist", authorize, wishList.create);
router.get("/user/wishlist", authorize, wishList.getAll);
router.delete("/user/wishlist/:locationId", authorize, wishList.delete);

// location
router.post("/location", authorize, formidable, location.createLocation);
router.get("/location", location.getAllLocation);
router.get("/location/search", location.getLocationByOwner);
router.get("/location/:locationId", location.getLocationById);
// req query


router.post("/location/:locationId/review", authorize, review.createReview);

// handle invalid route
router.all("*", (req, res) => {
	res.status(404).json({
		status: "failed",
		message: `Can't find ${req.originalUrl} on this server!, please read the documentation`,
	});
});

export default router;
