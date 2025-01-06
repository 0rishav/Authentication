import express from "express";
import { connectDB } from "./utils/db.js";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.js";
import registrationRouter from "./routes/registration.js";
import internshipRouter from "./routes/internship.js";
import adminRouter from "./routes/admin.js";
import paymentRouter from "./routes/payment.js";

import { ErrorMiddleware } from "./middlewares/error.js";
import { isAdmin, isAuthenticated } from "./middlewares/auth.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API WORKING",
  });
});

app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API IS WORKING ALL API IS WORKING",
  });
});

app.use(cookieParser());

const corsOptions = {
  origin: "https://codexuslabs.com",
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization,Origin,Accept",
};
app.use(cors(corsOptions));


app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));

app.post("/protected", isAuthenticated, (req, res) => {
  res.status(200).json({
    success: true,
    message: "This is a protected route. You are authenticated!",
    user: req.user,
  });
});

// Admin Route: Only admins can access
app.post("/admin", isAuthenticated, isAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: "This is an admin route. You are an admin!",
  });
});


app.use("/api/v1/auth", userRouter);
app.use("/api/v1", registrationRouter);
app.use("/api/v1", internshipRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/payment",paymentRouter);


app.use(ErrorMiddleware);

app.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
  connectDB();
});
