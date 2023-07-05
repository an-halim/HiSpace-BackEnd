import express from "express";
import {
	userController as user,
	locationController as location,
	reviewController as review,
	wishListController as wishList,
	menuController as menu,
	facilityController as facility,
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
router.get("/user", authorize, user.detail);
router.put("/user", authorize, formidable, user.updateDetail);
router.post("/user/wishlist", authorize, wishList.create);
router.get("/user/wishlist", authorize, wishList.getAll);
router.delete("/user/wishlist/:locationId", authorize, wishList.delete);

// location
router.post("/location", authorize, formidable, location.createLocation);
router.get("/location", authorize, location.getAllLocation);
router.get("/location/search", authorize, location.getLocationByOwner);
router.get("/location/:locationId", authorize, location.getLocationById);
router.put(
	"/location/:locationId",
	authorize,
	formidable,
	location.updateLocation
);
router.delete("/location/:locationId", authorize, location.deleteLocation);

// menu
router.post("/location/:locationId/menu", authorize, menu.addMenu);
router.get("/location/:locationId/menu", menu.getAllMenu);
router.put("/location/:locationId/menu/:menuId", authorize, menu.updateMenu);
router.delete("/location/:locationId/menu/:menuId", authorize, menu.deleteMenu);

// facility
router.post("/location/:locationId/facility", authorize, facility.create);
router.get("/location/:locationId/facility", facility.read);
router.put(
	"/location/:locationId/facility/:facilityId",
	authorize,
	facility.update
);
router.delete(
	"/location/:locationId/facility/:facilityId",
	authorize,
	facility.delete
);

// image
router.post(
	"/location/:locationId/galery",
	authorize,
	formidable,
	location.addGalery
);

// review
router.post("/location/:locationId/review", authorize, review.createReview);
router.get("/location/:locationId/review", authorize, review.getAllReview);
router.put("/location/:locationId/review", authorize, review.updateReview);
router.delete("/location/:locationId/review", authorize, review.deleteReview);

// handle invalid route
router.all("*", (req, res) => {
	res.status(404).json({
		status: "failed",
		message: `Can't find ${req.originalUrl} on this server!, please read the documentation`,
	});
});

export default router;
