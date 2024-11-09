import express from "express"
import { createInternshipRegistration, getAllInternshipRegistrations } from "../controllers/internship.js";


const internshipRouter = express.Router();

internshipRouter.post("/internship-registration",createInternshipRegistration)

internshipRouter.get("/get-internship",getAllInternshipRegistrations)

// userRouter.get("/me",isAuthenticated,authenticateMe)

export default internshipRouter