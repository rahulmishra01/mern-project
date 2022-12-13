const Product = require("../models/product");
const ErrorHandle = require("../utils/Errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/searchapifeatures");

// create Product

const createProduct = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(200).json({ success: true, product });
});

// get All Product
const getAllProducts = catchAsyncError(async (req, res) => {
  // pagination

  const resultPerPage = 5;
  const productCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const data = await apiFeature.query;
  res.status(200).json({ success: true, data });
});

// update product by Admin

const updateProducts = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  let data = await Product.findById({ _id: id });
  if (!data) {
    return next(new ErrorHandle("Product not found", 404));
  }
  data = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data });
});

const DeleteProducts = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const data = await Product.findById({ _id: id });
  if (!data) {
    return next(new ErrorHandle("Product not found", 404));
  }

  await data.remove();

  res
    .status(200)
    .json({ success: true, message: "product deleted successfully" });
});

const getOneProduct = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const data = await Product.findById({ _id: id });
  if (!data) {
    return next(new ErrorHandle("Product not found", 404));
  }
  res.status(200).json({ success: true, data, productCount });
});

module.exports = {
  createProduct,
  getAllProducts,
  updateProducts,
  DeleteProducts,
  getOneProduct,
};
