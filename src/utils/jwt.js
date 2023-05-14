import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();



const token = (data) => {
  return jwt.sign(
    data,
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
}

export default token;