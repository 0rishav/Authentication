import { updateAccessToken } from "../controllers/user.js";
import User from "../models/userModal.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { CatchAsyncError } from "./catchAsyncError.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = CatchAsyncError(async (req, res, next) => {
 
  const access_token = req.cookies.access_token;

  if (!access_token) {
    return next(new ErrorHandler("Please Login to access this resource", 400));
  }

  const decoded = jwt.decode(access_token);

  if (!decoded) {
    return next(new ErrorHandler("Access token is not valid", 400));
  }

  if (decoded.exp && decoded.exp <= Date.now() / 1000) {
    try {
      await updateAccessToken(req, res, next);
    } catch (error) {
      return next(error);
    }
  } else {
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorHandler("Please Login to access this resource", 400));
    }

    req.user = user;
    next();
  }
});

