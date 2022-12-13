const User = require("../models/user");
const ErrorHandler = require("../utils/Errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Register User
const registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is simple id",
      url: "hello",
    },
  });
  sendToken(user, 201, res);
});

// Login User

const LoginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given email or password
  if (!email || !password) {
    return next(new ErrorHandler("Plase enter email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email", 401));
  } else {
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return next(new ErrorHandler("Invalid Password"));
    }
  }
  sendToken(user, 200, res);
});

// Logout User

const LogoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "logged out user" });
});

// Forgot password

const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }
  //  get reset password token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/password/reset/${resetToken}`;
  const message = `your password reset token is \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then plase ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce password recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `email send ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});
// reset password
const resetPassword = catchAsyncError(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler("reset password token is invalid has been expires", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("password not matched", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});

// get user details

const getUserdetails = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findOne({ id: id });
  if (!user) {
    return next(new ErrorHandler("not details here", 400));
  }
  res.status(200).json({ success: true, user });
});

// update user password

const updateUserPassword = catchAsyncError(async (req, res, next) => {
  // const password = req.body.oldPassword;
  const user = await User.findById({ _id: req.user.id }).select("+password");
  const validPassword = await bcrypt.compare(
    req.body.oldPassword,
    user.password
  );
  if (!validPassword) {
    return next(new ErrorHandler("Invalid old Password", 400));
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password not matched", 400));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

// update user profile

const updateUserProfile = catchAsyncError(async (req, res, next) => {
  const newuser = { name: req.body.name, email: req.body.email };
  const user = await User.findByIdAndUpdate(req.user.id, newuser, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, user });
});

// get all users by (Admin)

const getAllUser = catchAsyncError(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json({ success: true, user });
});

// get single users by --> (Admin)

const getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("user does not exist this id", 400));
  }
  res.status(200).json({ success: true, user });
});

// update user role by --> Admin
const updateUserRole = catchAsyncError(async (req, res, next) => {
  const newuser = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  const user = await User.findByIdAndUpdate(req.user.id, newuser, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, user });
});

// delete user by --> Admin
const DeleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`user does not exist this id ${req.params.id}`, 400)
    );
  }
  res.status(200).json({ success: true });
});

module.exports = {
  registerUser,
  LoginUser,
  LogoutUser,
  forgotPassword,
  resetPassword,
  getUserdetails,
  updateUserPassword,
  updateUserProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  DeleteUser,
};
