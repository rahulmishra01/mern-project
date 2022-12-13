const express = require("express");
const router = express.Router();
const { isAuthincated, authorizeRoles } = require("../middleware/authincation");

const userRoute = require("../controller/userController");
router.post("/register", userRoute.registerUser);
router.post("/login", userRoute.LoginUser);
router.get("/logout", userRoute.LogoutUser);
router.post("/forgot", userRoute.forgotPassword);
router.put("/password/reset/:token", userRoute.resetPassword);
router.get("/me", isAuthincated, userRoute.getUserdetails);
router.put("/update", isAuthincated, userRoute.updateUserPassword);
router.put("/update/profile/", isAuthincated, userRoute.updateUserProfile);
// get all user by admin
router.get("/admin/user/",isAuthincated, authorizeRoles("admin"), userRoute.getAllUser);
router.get("/admin/user/:id",isAuthincated, authorizeRoles("admin"), userRoute.getSingleUser);
router.put("/admin/user/:id",isAuthincated, authorizeRoles("admin"), userRoute.updateUserRole);
router.delete("/admin/delete",isAuthincated, authorizeRoles("admin"), userRoute.DeleteUser);

module.exports = router;
