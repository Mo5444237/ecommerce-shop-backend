const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const optGenerator = require("otp-generator");

const { generateAccessToken, generateRefreshToken} = require('../utils/generate-token');

const sendEmail = require("../utils/send-email");
const User = require("../models/user");

exports.signup = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
    });
    const result = await user.save();
    res
      .status(201)
      .json({ message: "User created.", userId: result._id.toString() });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Invalid input");
    error.data = errors.array();
    error.statusCode = 422;
    return next(error);
  }

  try {
    const user = await User.findOne({ email: email });
      
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }
    const accessToken = generateAccessToken(user._id.toString());

    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    delete user._doc.password,
    delete user._doc.refreshTokens;


    // send httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ message: "Logged in successfully", user: user, token: accessToken });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH_KEY
    );

    const user = await User.findOne({ "refreshTokens.token": refreshToken });

    if (!user || !decoded) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id.toString());

    res.status(201).json({ token: newAccessToken });
  } catch (error) {
    next(error);
  }
};

exports.getLoggedUserData = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    delete user._doc.password;
    delete user._doc.refreshTokens;

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  const userId = req.userId;
  const refreshToken = req.cookies.refreshToken;
  try {
    await User.updateOne(
      { _id: userId },
      { $pull: { refreshTokens: { token: refreshToken } } }
    );
    
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    
    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    next(error);
  }
};

exports.passwordResetOtp = async (req, res, next) => {
  const email = req.body.email;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid E-mail");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    const otp = optGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const user = await User.findOne({ email: email });
    user.passwordResetToken = otp;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();
    sendEmail({
      to: user.email,
      subject: "Password reset",
      message: `
                <p>Hello, ${user.name}.</p>
                <p>Reset Password token: <b>${otp}</b></p>
            `,
    });
    res.status(201).json({ message: "Token generated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const otp = req.body.otp;
  const newPassword = req.body.newPassword;
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid input");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    const user = await User.findOne({
      passwordResetToken: otp,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error("Invalid or expired token");
      error.statusCode = 422;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset done." });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  const oldPassword = req.body.oldPassword || "";
  const newPassword = req.body.newPassword;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid input");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    const user = await User.findById(req.userId);
    const isEqual = await bcrypt.compare(oldPassword, user.password);
    if (!isEqual) {
      const error = new Error("invalid password");
      error.statusCode = 422;
      return next(error);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "password changed" });
  } catch (error) {
    next(error);
  }
};
