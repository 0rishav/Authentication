import express from "express"
import { connectDB } from "./utils/db.js"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.js"
import registrationRouter from "./routes/registration.js"
import internshipRouter from "./routes/internship.js"
import { ErrorMiddleware } from "./middlewares/error.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000



app.get("/",(req,res)=>{
  res.status(200).json({
      success:true,
      message:"API WORKING"
  })
})

app.get("/test",(req,res)=>{
  res.status(200).json({
      success:true,
      message:"API IS WORKING ALL API IS WORKING"
  })
})


app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"))
app.use(cookieParser());
const corsOptions = {
    origin: 'http://127.0.0.1:5500',
    credentials: true,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization', 
  };
  
app.use(cors(corsOptions))

app.use("/api/v1/auth", userRouter);
app.use("/api/v1",registrationRouter)
app.use("/api/v1",internshipRouter)



app.use(ErrorMiddleware);

app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
  });
  

app.listen(PORT, ()=>{
    console.log(`Server is running on PORT ${PORT}`)
    connectDB();
});