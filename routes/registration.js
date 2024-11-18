import express from "express"
import { createProjectRegistration, getAllProjectRegistrations, getAllProjectsDetails,  getProjectStatusHistory,  updateProjectStatus } from "../controllers/registration.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";


const registrationRouter = express.Router();

registrationRouter.post("/project-registration",isAuthenticated,createProjectRegistration);

registrationRouter.put('/project-status/:projectId',isAuthenticated,isAdmin, updateProjectStatus);

// registrationRouter.put("/project-track",isAuthenticated)

registrationRouter.get("/status-history/:projectId",isAuthenticated,getProjectStatusHistory)


registrationRouter.get('/all-project-status',isAuthenticated,isAdmin,getAllProjectsDetails);

registrationRouter.get("/get-registration",isAuthenticated,isAdmin,getAllProjectRegistrations);


export default registrationRouter