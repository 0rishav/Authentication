import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import { CatchAsyncError } from "../middlewares/catchAsyncError.js";
import User from "../models/userModal.js";
import { sendMail } from "../utils/sendMail.js";
import { fileURLToPath } from "url";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";

dotenv.config();

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefreshToken:", error.message);
    throw new Error("Failed to generate tokens");
  }
};

export const registrationUser = CatchAsyncError(async (req, res, next) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  try {
    const { name, email, password } = req.body;
    const isEmailExist = await User.findOne({ email });

    if (isEmailExist) {
      return next(new ErrorHandler("Email Already Exists", 400));
    }

    const user = {
      name,
      email,
      password,
    };

    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;
    const data = { user: { name: user.name }, activationCode };
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/activation-mail.ejs"),
      data
    );

    try {
      await sendMail({
        email: user.email,
        subject: "Activate Your Account",
        template: "activation-mail.ejs",
        data,
      });
      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const createActivationToken = (user) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET,
    {
      expiresIn: "5m",
    }
  );
  return { token, activationCode };
};

export const activateUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { activation_token, activation_code } = req.body;

    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

    if (newUser.activationCode !== activation_code) {
      return next(new ErrorHandler("Invalid Activation Code", 400));
    }

    const { name, email, password } = newUser.user;

    const existUser = await User.findOne({ email });

    if (existUser) return next(new ErrorHandler("Email Already Exists", 400));

    const user = await User.create({
      name,
      email,
      password,
    });
    user.password = undefined;
    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const loginUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please Enter Email or Password", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("Invalid Email or Password", 400));
    }

    const isPasswordMatch = await user.isPasswordCorrect(password);

    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid Email or Password", 400));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true, 
      secure: true, 
      sameSite: "None", 
      maxAge: 15 * 60 * 1000, 
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 2 * 24 * 60 * 60 * 1000 , 
    });

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    return res.status(200).json({
      success: true,
      user: loggedInUser,
      accessToken: accessToken,
      message: "User LoggedIn Successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const refreshAccessToken = CatchAsyncError(async (req, res, next) => {
  const incomingRefreshToken = req.cookies.refreshToken;


  if (!incomingRefreshToken) {
    return next(new ErrorHandler("UnAuthorized Request!", 401));
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return next(new ErrorHandler("Invalid Token!", 404));
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      return next(new ErrorHandler("UnAuthorized Token is Expired!", 401));
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true, 
      secure: true, 
      sameSite: "None", 
      maxAge: 15 * 60 * 1000, 
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 2 * 24 * 60 * 60 * 1000, 
    });

    return res.status(200).json({
      success: true,
      message: "Token Refreshed Successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.refreshToken = undefined;
      await user.save();

      res.cookie("accessToken", "", {
        httpOnly: true,
        secure: true, 
        sameSite: "None", 
        expires: new Date(0), 
      });

      res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(0), 
      });

      res.status(200).json({
        success: true,
        message: "Logged Out Successfully",
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return next(new ErrorHandler("UnAuthorized Token is Required!", 401));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      return next(new ErrorHandler("Invalid or Expired Token!", 401));
    }

    const userId = decodedToken?._id;

    const user = await User.findById(userId)
      .select("-password -refreshToken") 
      .populate({
        path: "projectsCreated",  
        select: "_id projectName projectDescription status", 
      });

    if (!user) {
      return next(new ErrorHandler("User Not Found!", 404));
    }

    return res.status(200).json({
      success: true,
      user,
      accessToken:token,
      message: "User details fetched successfully!",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
};

export const updateUserDetails = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return next(new ErrorHandler("Unauthorized! Token is required.", 401));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      return next(new ErrorHandler("Invalid or Expired Token!", 403));
    }

    const userId = decodedToken?._id;

    const user = await User.findById(userId).select("-password -role -refreshToken");

    if (!user) {
      return next(new ErrorHandler("User not found!", 404));
    }

    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });

    await user.save();

    return res.status(200).json({
      success: true,
      user,
      message: "User details updated successfully!",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
};

export const getAllUsers = CatchAsyncError(async (req, res, next) => {
  try {
    const users = await User.find().select("-password -refreshToken");

    if (!users || users.length === 0) {
      return next(new ErrorHandler("No users found!", 404));
    }

    return res.status(200).json({
      success: true,
      users,
      message: "Users fetched successfully!",
    });
  } catch (error) {
    return next(new ErrorHandler("Unable to fetch users!", 500));
  }
});

export const updateUserRole = CatchAsyncError(async (req, res, next) => {
  try {
    const { role } = req.body; 
    const { id } = req.params;

    if (req.user.role !== "admin") {
      return next(new ErrorHandler("Access denied! Admin only action.", 403));
    }

    const user = await User.findById(id);

    if (!user) {
      return next(new ErrorHandler("User not found!", 404));
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully!`,
    });
  } catch (error) {
    return next(new ErrorHandler("Unable to update role!", 500));
  }
})
