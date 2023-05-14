import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import response from "../utils/response.js";

dotenv.config();

const authorize = (req, res, next) => {
  try {
    const token =
      req.headers?.authorization?.split(" ")[1] || req.cookies["token"];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) response.unauthorized(res, "You are not authorized");
    else {
      req.user = decoded;
      next();
    };
  } catch (err) {
    console.log(err);
    response.unauthorized(res, "You are not authorized");
  }
};
export default authorize;
