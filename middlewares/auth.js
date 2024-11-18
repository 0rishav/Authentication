import User from "../models/userModal.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { CatchAsyncError } from "./catchAsyncError.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(
        new ErrorHandler("Please login to access this resource", 401)
      );
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      return next(new ErrorHandler("Invalid Token!", 404));
    }

    if (!user.refreshToken) {
      return next(new ErrorHandler("UnAuthorized Access. Please login again.", 401));
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }

    next();
  } catch (error) {
    return next(new ErrorHandler(error.message, 404));
  }
};
export const isAdmin = CatchAsyncError(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  if (user.role !== "admin") {
    return next(new ErrorHandler("Access denied. You are not an admin.", 403));
  }
  next();
});
