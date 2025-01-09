import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const verifyJwt = async (req, _, next) => {
  const isAccessTokenValid =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");

  if (!isAccessTokenValid) {
    throw new ApiError(404, "Unauthorize Request");
  }
  const verifyToken = await jwt.verify(
    isAccessTokenValid,
    process.env.ACCESS_TOKEN_SECRET
  );
  console.log("verifyToken", verifyToken);

  const user = await User.findById(verifyToken?._id).select(
    "-password -refreshToken"
  );
  req.user = user;
  next();
};

export { verifyJwt };
