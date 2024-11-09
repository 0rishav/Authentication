import express from "express"
import { adminLogin, createAdmin, deleteAdmin, getAllAdmins, verifyAdminOTP } from "../controllers/admin.js";


const adminRouter = express.Router();

adminRouter.post("/create",createAdmin);
adminRouter.post("/login",adminLogin);
adminRouter.post("/verify",verifyAdminOTP);
adminRouter.get("/all-admin",getAllAdmins);
adminRouter.delete("/delete-admin/:adminId",deleteAdmin)


export default adminRouter;