import ErrorHandler from "../utils/ErrorHandler.js";
import { CatchAsyncError } from "../middlewares/catchAsyncError.js";
import internshipRegistration from "../models/internshipModal.js";

export const createInternshipRegistration = CatchAsyncError(
  async (req, res, next) => {
    const {
      firstname,
      lastname,
      email,
      mobileNumber,
      internshipField,
      availability,
      skills,
      projectDescription,
    } = req.body;

    if (!firstname || firstname.trim().length < 2) {
      return next(
        new ErrorHandler("Firstname must be at least 2 characters long", 400)
      );
    }

    if (!lastname || lastname.trim().length < 2) {
      return next(
        new ErrorHandler("Lastname must be at least 2 characters long", 400)
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return next(new ErrorHandler("Please provide a valid email", 400));
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileNumber || !mobileRegex.test(mobileNumber)) {
      return next(
        new ErrorHandler("Mobile number must be a valid 10-digit number", 400)
      );
    }

    const internshipOptions = [
      "Software Development",
      "Marketing",
      "Graphic Design",
      "Human Resources",
    ];
    if (!internshipField || !internshipOptions.includes(internshipField)) {
      return next(
        new ErrorHandler("Please select a valid Internship Field", 400)
      );
    }

    const validAvailability = ["3", "6", "9"];
    if (!availability || !validAvailability.includes(availability)) {
      return next(new ErrorHandler("Please select a valid availability", 400));
    }

    if (!skills || skills.trim().length < 10) {
      return next(
        new ErrorHandler(
          "Skills description must be at least 10 characters long",
          400
        )
      );
    }

    if (!projectDescription || projectDescription.trim().length < 20) {
      return next(
        new ErrorHandler(
          "Project description must be at least 20 characters long",
          400
        )
      );
    }

    try {
      const newProject = await internshipRegistration.create({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        internshipField,
        availability,
        skills: skills.trim(),
        projectDescription: projectDescription.trim(),
      });

      res.status(201).json({
        success: true,
        message: "Project Registered Successfully",
        project: {
          firstname: newProject.firstname,
          lastname: newProject.lastname,
          email: newProject.email,
          internshipField: newProject.internshipField,
          availability: newProject.availability,
          skills: newProject.skills,
          projectDescription: newProject.projectDescription,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
