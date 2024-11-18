import express from "express"
import { createPayment, verifyPayment } from "../controllers/payment.js";


const paymentRouter = express.Router();


paymentRouter.post("/create-payment",createPayment);

paymentRouter.post("/verify-payment",verifyPayment);



export default paymentRouter