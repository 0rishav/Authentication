import express from "express"
import {activateUser, loginUser,registrationUser } from "../controllers/user.js";

const userRouter = express.Router();

userRouter.post("/register",registrationUser)

userRouter.post("/activate-user",activateUser)

userRouter.post("/login",loginUser)



// userRouter.get("/me",isAuthenticated,authenticateMe)

export default userRouter