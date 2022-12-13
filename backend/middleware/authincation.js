const ErrorHandler = require("../utils/Errorhandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
exports.isAuthincated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("please login to access this resource", 401));
  }
  const decodedata = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedata.id);
  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role ${req.user.role} is not allowed to check this resource`,
          403
        )
      );
    } else {
      next();
    }
  };
};
