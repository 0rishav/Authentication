import express from "express"
import {activateUser, getAllUsers, getUserDetails, loginUser,logoutUser,refreshAccessToken,registrationUser, updateUserDetails, updateUserRole} from "../controllers/user.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.get("/me",isAuthenticated,getUserDetails)

userRouter.get("/all-user",isAuthenticated,isAdmin,getAllUsers)

userRouter.post("/refresh-token",refreshAccessToken)

userRouter.post("/register",registrationUser)

userRouter.post("/activate-user",activateUser)

userRouter.post("/login",loginUser)

userRouter.post("/logout",isAuthenticated,logoutUser)

userRouter.put("/update",isAuthenticated,updateUserDetails)

userRouter.put("/user/role/:id", isAuthenticated, isAdmin,updateUserRole);






export default userRouter