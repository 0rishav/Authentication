import { CatchAsyncError } from "../middlewares/catchAsyncError.js";
import Admin from "../models/adminModal.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken"
import { fileURLToPath } from "url";
import path from "path";
import ejs from "ejs";
import { sendMail } from "../utils/sendMail.js";
import bcrypt from 'bcrypt';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const createAdmin = CatchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ErrorHandler("Please enter a valid email address", 400));
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return next(new ErrorHandler("Admin with this email already exists", 400));
  }

  if (!passwordRegex.test(password)) {
    return next(new ErrorHandler("Password must be at least 8 characters, contain a lowercase letter, uppercase letter, a number, and a special character", 400));
  }

  const admin = new Admin({
    email,
    password,
  });

  await admin.save();

  res.status(201).json({
    success: true,
    message: 'Credentials created successfully!',
  });
});


export const adminLogin = CatchAsyncError(async (req, res, next) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }

       
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        
        const otpToken = jwt.sign(
            { otp },
            process.env.ADMIN_JWT_SECRET_KEY, 
            { expiresIn: '10m' }
        );

        const data = { otp };
        const html = await ejs.renderFile(
            path.join(__dirname, "../mails/otp-mail.ejs"),
            data
        );

        try {
            await sendMail({
                email: admin.email,
                subject: "Your OTP for Admin Login",
                template: "otp-mail.ejs",
                data,
            });

            res.status(200).json({
                success: true,
                message: "OTP sent to your email. Please check your inbox.",
                otpToken,
            });
        } catch (error) {
            return next(new ErrorHandler("Failed to send OTP. Please try again.", 500));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});


export const verifyAdminOTP = CatchAsyncError(async (req, res, next) => {
    const { otpToken, enteredOtp } = req.body;

    try {
        const decoded = jwt.verify(otpToken, process.env.ADMIN_JWT_SECRET_KEY);

        if (decoded.otp !== enteredOtp) {
            return next(new ErrorHandler("Invalid OTP", 400));
        }

        res.status(200).json({
            success: true,
            message: "Admin login successful"
        });
    } catch (error) {
        return next(new ErrorHandler("OTP verification failed or expired", 400));
    }
});

export const getAllAdmins = CatchAsyncError(async (req, res, next) => {
    try {
        const admins = await Admin.find().select("-password");
        res.status(200).json({
            success: true,
            admins
        });
    } catch (error) {
        return next(new ErrorHandler("Failed to fetch admins", 500));
    }
});

export const deleteAdmin = CatchAsyncError(async (req, res, next) => {
    const { adminId } = req.params; 

    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return next(new ErrorHandler("Admin not found", 404));
        }

        await admin.deleteOne();  
        res.status(200).json({
            success: true,
            message: "Admin deleted successfully."
        });
    } catch (error) {
        return next(new ErrorHandler("Failed to delete admin", 500));
    }
});

