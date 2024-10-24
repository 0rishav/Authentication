import express from "express"
import { createProjectRegistration } from "../controllers/registration.js";


const registrationRouter = express.Router();

registrationRouter.post("/project-registration",createProjectRegistration)

// userRouter.get("/me",isAuthenticated,authenticateMe)

export default registrationRouter