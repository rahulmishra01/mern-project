const express = require("express");
const router = express.Router();

// product by admin routers
const product = require("../controller/productcontroller");
const { isAuthincated, authorizeRoles } = require("../middleware/authincation");
router.post("/product/new/",isAuthincated,authorizeRoles("admin"),product.createProduct);
router.get("/product", product.getAllProducts);
router.get("/product/:id", product.getOneProduct);
router.put("/product/:id",isAuthincated,authorizeRoles("admin"),product.updateProducts);
router.delete("/product/:id",isAuthincated,authorizeRoles("admin"),product.DeleteProducts);
module.exports = router;
