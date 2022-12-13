//  authintaction
const catchAsynnError = require("./backend/middleware/catchAsyncError");
const ErrorHandler = require("./backend/utils/Errorhandler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./backend/models/user");

const isAuthintaction = catchAsynnError(async (req, res, next) => {
  const token = req.cookies;
  if (!token) {
    return next(new ErrorHandler("please login after you can access it", 403));
  }
  const data = jwt.verify(process.env.COOKIES_EXPIRES, token);
  req.user = await User.findOne(data.id);
  next();
});

const roleDirectors = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} <-- this role is not applicable`,
          401
        )
      );
    } else {
      next();
    }
  };
};
module.exports = { isAuthintaction, roleDirectors };

// catchAsyncError error

module.exports = (catchAsyncError) => (req, res, next) => {
  Promise.resolve(catchAsyncError(req, res, next)).catch(next);
};

// custom error

module.exports = (err, req, res, next) => {
  err.message = err.message || "internal server error";
  err.statusCode = err.statusCode || 500;
  res.statud(err.statusCode).json({ success: false, message: err.message });
};

// errorhandler

class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = ErrorHandler;

// send token

const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIES_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, user, token });
};

module.exports = { sendToken, searchApi };

// search Api

class searchApi {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }
  filter() {
    const queryCopy = this.queryStr;
    const resetFeilds = ["keyword", "page", "limit"];
    resetFeilds.forEach((key) => delete queryCopy[key]);
    this.query = this.query.find({ ...queryCopy });
    return this;
  }
  // pagination
  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);
    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

// send Email

const ndoemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transpoter = ndoemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transpoter.sendEmail(mailOptions);
};

module.exports = sendEmail;

// user api

const registerApi = catchAsynnError(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = new User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is ssample",
      url: "sample",
    },
  });
  sendToken(user, 200, res);
});

const LoginApi = catchAsynnError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler(`please fill all feilds`, 401));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler(`invalid email`, 400));
  } else {
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return next(new ErrorHandler(`invalid password`, 400));
    }
  }
  sendToken(user, 200, res);
});

const LogoutApi = catchAsynnError(async (req, res, next) => {
  req.cookies("token", null, {
    expires: Date(Date.now() + 15 * 60 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "logout user" });
});

const forgotPassword = catchAsynnError(async(req, res, next) => {
    const user = await User.findOne()
})

module.exports = { registerApi, LoginApi, LogoutApi, forgotPassword };
