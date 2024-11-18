import ErrorHandler from "../utils/ErrorHandler.js";
import { CatchAsyncError } from "../middlewares/catchAsyncError.js";
import ProjectRegistration from "../models/registrationModal.js";
import User from "../models/userModal.js";

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
      queries: queries ? queries.trim() : '',
      statusHistory: [{ 
        status: "Initiated", 
        updatedAt: Date.now(),
      }],
    });

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { projectsCreated: newProject._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Project Registered Successfully',
      project: {
        id: newProject._id,
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

export const updateProjectStatus = CatchAsyncError(async (req, res, next) => {
  const projectId = req.params.projectId;

  const statusOrder = ["Initiated", "In Progress", "Review", "Completed", "Delivered"];
  const statusPercentageMapping = {
    "Initiated": 0,
    "In Progress": 25,
    "Review": 50,
    "Completed": 75,
    "Delivered": 100,
  };

  const project = await ProjectRegistration.findById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const currentStatus = project.status;

  if (currentStatus === "Delivered") {
    return next(new ErrorHandler("Project is already delivered. No further updates allowed.", 400));
  }

  const currentStatusIndex = statusOrder.indexOf(currentStatus);
  const newStatus = statusOrder[currentStatusIndex + 1]; 
  const newPercentage = statusPercentageMapping[newStatus];

  if (!project.statusHistory) {
    project.statusHistory = []; 
  }

  project.statusHistory.push({
    status: newStatus,
    updatedAt: Date.now(),
    percentage: newPercentage,
  });

  project.status = newStatus;
  project.completionPercentage = newPercentage;

  await project.save();

  res.status(200).json({
    success: true,
    message: `Project status updated to ${newStatus}`,
    project: {
      id: project._id,
      projectName: project.projectName,
      status: project.status,
      completionPercentage: project.completionPercentage,
      statusHistory: project.statusHistory,
    }
  });
});

export const getProjectStatusHistory = CatchAsyncError(async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    const project = await ProjectRegistration.findById(projectId);

    if (!project) {
      return next(new ErrorHandler("Project not found", 404));
    }

    res.status(200).json({
      success: true,
      statusHistory: project.statusHistory,
    });
  } catch (error) {
    return next(new ErrorHandler("Unable to fetch status history", 500));
  }
});

export const getAllProjectsDetails = CatchAsyncError(async (req, res, next) => {
  try {
    const projects = await ProjectRegistration.find({}, "_id projectName firstname lastname email status completionPercentage");

    res.status(200).json({
      success: true,
      projects: projects.map(project => ({
        _id:project._id,
        projectName: project.projectName,
        firstname: project.firstname,
        lastname: project.lastname,
        email: project.email,
        status: project.status,
        completionPercentage: project.completionPercentage,
      })),
    });
  } catch (error) {
    return next(new ErrorHandler("Unable to fetch project details", 500));
  }
});


export const getAllProjectRegistrations = CatchAsyncError(
  async (req, res, next) => {
    try {
      const projects = await ProjectRegistration.find();

      res.status(200).json({
        success: true,
        count: projects.length,
        projects,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);