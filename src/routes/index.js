import express from "express";
import { userController as user } from "../controllers/index.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

router.post("/signup", user.regist);
router.post("/login", user.login);
router.post("/reset-password", user.forgot);
router.post("/reset-password/:token", user.upadatePassword);
router.post("/verify-token/:token", user.verifyToken);
router.get("/me", authorize, user.detail);
router.put("/me", authorize, user.updateDetail);



// handle invalid route
router.all("*", (req, res) => {
  res.status(404).json({
    status: "failed",
    message: `Can't find ${req.originalUrl} on this server!, please read the documentation`,
  });
});

export default router;
