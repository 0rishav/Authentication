import mongoose from "mongoose";
import validator from "validator";

const internshipRegistrationSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Please enter your first name"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastname: {
      type: String,
      required: [true, "Please enter your last name"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email address"],
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email address"],
    },
    mobileNumber: {
      type: String,
      required: [true, "Please enter your mobile number"],
      validate: {
        validator: function (v) {
          return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(v);
        },
        message: "Please enter a valid mobile number",
      },
    },
    internshipField: {
      type: String,
      enum: {
        values: [
          "Software Development",
          "Marketing",
          "Graphic Design",
          "Human Resources",
        ],
        message: "Please select a valid Internship Field option",
      },
      required: [true, "Please select your Internship Field"],
    },
    availability: {
      type: String,
      enum: {
        values: ["3", "6", "9"],
        message: "Please select a valid availability",
      },
      required: [true, "Please select your availability"],
    },
    skills: {
      type: String,
      required: [true, "Please describe your relevant skills"],
      trim: true,
      minlength: [10, "Skills description must be at least 10 characters long"],
      maxlength: [500, "Skills description cannot exceed 500 characters"],
    },
    projectDescription: {
      type: String,
      required: [true, "Please provide a description of your project"],
      minlength: [
        20,
        "Project description must be at least 20 characters long",
      ],
      maxlength: [1000, "Project description cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);


const internshipRegistration = mongoose.model(
  "InternshipRegistration",
  internshipRegistrationSchema
);

export default internshipRegistration;
