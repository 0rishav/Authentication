import express from "express"
import { createInternshipRegistration } from "../controllers/internship.js";


const internshipRouter = express.Router();

internshipRouter.post("/internship-registration",createInternshipRegistration)

// userRouter.get("/me",isAuthenticated,authenticateMe)

export default internshipRouter