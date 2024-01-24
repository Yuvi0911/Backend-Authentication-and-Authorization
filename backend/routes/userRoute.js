const express = require("express");
const { registerUser, loginUser, logout, forgetPassword, resetPassword, getUserDetails, UpdatePassword, UpdateProfile, getAllUser, getSingleUser, UpdateUserRole, deleteUser } = require("../controllers/userController");
const {isAuthenticatedUser, authorizeRoles } = require("../middleware/auth")

const router = express.Router();


router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forget").post(forgetPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticatedUser, getUserDetails)

router.route("/password/update").put(isAuthenticatedUser, UpdatePassword)

router.route("/me/update").put(isAuthenticatedUser, UpdateProfile)

router.route("/admin/users").get(isAuthenticatedUser,authorizeRoles("admin"),getAllUser)

router.route("/admin/user/:id").get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUser).put(isAuthenticatedUser,authorizeRoles("admin"),UpdateUserRole).delete(isAuthenticatedUser,authorizeRoles("admin"),deleteUser)

module.exports = router;