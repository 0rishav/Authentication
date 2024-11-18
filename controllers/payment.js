import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/paymentModal.js";
import { CatchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createPayment = CatchAsyncError(async (req, res, next) => {
  const { amount, subscription_plan, name, email } = req.body;

  try {
    if (!subscription_plan || !name || !email) {
      return next(new ErrorHandler("Name, email, and subscription plan are required", 400));
    }

    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`, 
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return next(new ErrorHandler("Failed to create Razorpay order", 500));
    }

    res.status(200).json({
      success: true,
      order,
      name,
      email,
      subscription_plan,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const verifyPayment = CatchAsyncError(async (req, res, next) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    amount,
    name,
    email,
    subscription_plan,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");
    

  if (expectedSignature !== razorpay_signature) {
    return next(new ErrorHandler("Invalid Payment Signature", 400));
  }

  try {
    const payment = new Payment({
      amount,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      paymentStatus: "Paid",
      name,
      email,
      subscriptionPlan: subscription_plan,
    });

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment verified and subscription updated successfully",
    });
  } catch (error) {
    console.error("Error processing payment:", error.message);
    return next(
      new ErrorHandler("Error saving payment and updating subscription", 500)
    );
  }
});


