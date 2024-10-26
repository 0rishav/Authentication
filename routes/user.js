import express from "express"
import {activateUser, loginUser,logoutUser,registrationUser} from "../controllers/user.js";

const userRouter = express.Router();

userRouter.post("/register",registrationUser)

userRouter.post("/activate-user",activateUser)

userRouter.post("/login",loginUser)

userRouter.post("/logout",logoutUser)



// userRouter.get("/me",isAuthenticated,authenticateMe)

export default userRouter