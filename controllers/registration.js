import ErrorHandler from "../utils/ErrorHandler.js";
import { CatchAsyncError } from "../middlewares/catchAsyncError.js";
import ProjectRegistration from "../models/registrationModal.js";

export const createProjectRegistration = CatchAsyncError(async (req, res, next) => {
  const {
    firstname,
    lastname,
    email,
    mobileNumber,
    collegeName,
    degree,
    semester,
    projectName,
    projectDescription,
    dateGiven,
    deadline,
    queries
  } = req.body;

  if (!firstname || firstname.trim().length < 2) {
    return next(new ErrorHandler("Firstname must be at least 2 characters long", 400));
  }
  
  if (!lastname || lastname.trim().length < 2) {
    return next(new ErrorHandler("Lastname must be at least 2 characters long", 400));
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return next(new ErrorHandler("Please provide a valid email", 400));
  }

  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileNumber || !mobileRegex.test(mobileNumber)) {
    return next(new ErrorHandler("Mobile number must be a valid 10-digit number", 400));
  }

  const validDegrees = ['BE', 'B.tech', 'M.tech', 'MCA', 'BCA', 'B.sc', 'M.sc', 'Ph.D'];
  if (!degree || !validDegrees.includes(degree)) {
    return next(new ErrorHandler("Please select a valid degree", 400));
  }

  const validSemesters = ['1st semester', '2nd semester', '3rd semester', '4th semester', '5th semester', '6th semester', '7th semester', '8th semester'];
  if (!semester || !validSemesters.includes(semester)) {
    return next(new ErrorHandler("Please select a valid semester", 400));
  }

  if (!projectName || projectName.trim().length < 5) {
    return next(new ErrorHandler("Project name must be at least 5 characters long", 400));
  }

  if (!projectDescription || projectDescription.trim().length < 10) {
    return next(new ErrorHandler("Project description must be at least 10 characters long", 400));
  }

  const givenDate = new Date(dateGiven);
  const deadlineDate = new Date(deadline);

  if (isNaN(givenDate.getTime()) || isNaN(deadlineDate.getTime())) {
    return next(new ErrorHandler("Please provide valid dates for project", 400));
  }

  if (givenDate >= deadlineDate) {
    return next(new ErrorHandler("Deadline must be after the date given", 400));
  }

  try {
    const newProject = await ProjectRegistration.create({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      collegeName: collegeName.trim(),
      degree,
      semester,
      projectName: projectName.trim(),
      projectDescription: projectDescription.trim(),
      dateGiven,
      deadline,
      queries: queries ? queries.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Project Registered Successfully',
      project: {
        firstname: newProject.firstname,
        lastname: newProject.lastname,
        email: newProject.email,
        degree: newProject.degree,
        semester: newProject.semester,
        projectName: newProject.projectName,
        dateGiven: newProject.dateGiven,
        deadline: newProject.deadline
      }
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
