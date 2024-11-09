import express from "express"
import { createProjectRegistration, getAllProjectRegistrations } from "../controllers/registration.js";


const registrationRouter = express.Router();

registrationRouter.post("/project-registration",createProjectRegistration)

registrationRouter.get("/get-registration",getAllProjectRegistrations)

// userRouter.get("/me",isAuthenticated,authenticateMe)

export default registrationRouter