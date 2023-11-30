const express = require("express");
const router = express.Router();

const isAuth = require("../middlewares/is-auth");

const {
  signup,
  login,
  logout,
  refreshToken,
  passwordResetOtp,
  resetPassword,
  changePassword,
  getLoggedUserData,
} = require("../controllers/auth");

const {
  signupValidation,
  loginValidation,
  resetPasswordValidation,
  newPasswordValidation,
} = require("../validation/auth");


router.post("/signup", signupValidation, signup);

router.post("/login", loginValidation, login);

router.get('/profile', isAuth, getLoggedUserData);

router.get("/logout", isAuth, logout);

router.get("/refresh-token", refreshToken);

router.post("/reset-token", resetPasswordValidation, passwordResetOtp);

router.put("/reset-password", newPasswordValidation, resetPassword);

router.put("/change-password", isAuth, newPasswordValidation, changePassword);

module.exports = router;
