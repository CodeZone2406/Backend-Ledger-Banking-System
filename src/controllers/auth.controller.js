/**
 * Authentication request handlers for registering and signing in users.
 *
 * @module controllers/auth
 */
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackListModel = require("../models/blackList.model")

/**
 * Registers a user, issues a JWT, and sends a registration email.
 *
 * Responds with 422 if the email is already registered. On success, creates
 * the user, sets the JWT in a cookie, and returns the user details and token
 * with a 201 response.
 *
 * @param {import("express").Request<{}, any, { email: string, password: string, name: string }>} req
 *   Express request containing the new user's email, password, and name.
 * @param {import("express").Response} res
 *   Express response used to set the token cookie and send the registration
 *   result.
 * @returns {Promise<void | import("express").Response>}
 *   Resolves after sending the registration response, or with the duplicate-
 *   email response.
 * @throws {Error} If the user lookup, creation, JWT signing, or registration
 *   email operation fails.
 */
async function userRegisterController(req, res) {
  const { email, password, name } = req.body;

  const isExists = await userModel.findOne({ email: email });

  if (isExists) {
    return res.status(422).json({
      message: "User already registered with email.",
      status: "Failed",
    });
  }

  const user = await userModel.create({
    email,
    password,
    name,
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("token", token);

  res.status(201).json({
    status: "success",
    message: "User has been registered successfully",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });

  await emailService.sendRegisterationEmail(user.email, user.name);
}

/**
 * Authenticates a user, sets an authentication cookie, and returns a JWT.
 *
 * Responds with 401 if the email is unknown or the password is incorrect.
 * Otherwise, issues a three-day JWT, sets it in a cookie, and responds with
 * the authenticated user's public details.
 *
 * @param {import("express").Request<{}, any, { email: string, password: string }>} req
 *   Express request containing the user's email and password.
 * @param {import("express").Response} res
 *   Express response used to set the token cookie and send the result.
 * @returns {Promise<void | import("express").Response>}
 *   Resolves after sending the login response, or with the failed-
 *   authentication response.
 * @throws {Error} If the user lookup, password comparison, or JWT signing
 *   fails.
 */
async function userLoginController(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      message: "Email or password is invalid",
      status: "Failed",
    });
  }

  const isvalidPassword = await user.comparePassword(password);

  if (!isvalidPassword) {
    return res.status(401).json({
      message: "Email or password is invalid",
      status: "Failed",
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("token", token);

  res.status(200).json({
    status: "success",
    message: "User has been Logged In successfully",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

/**
 * Logs out the current user by blacklisting their token and clearing its cookie.
 *
 * Reads the token from the `token` cookie or the `Authorization` header.
 * Responds with 400 if no token is present; otherwise, stores the token in the
 * blacklist, clears the cookie, and responds with 200.
 *
 * @param {import("express").Request} req
 *   Express request containing the token cookie or authorization header.
 * @param {import("express").Response} res
 *   Express response used to clear the token cookie and send the result.
 * @returns {Promise<import("express").Response>}
 *   Resolves with the already-logged-out or successful logout response.
 * @throws {Error} If storing the token in the blacklist fails.
 */
async function userLogoutController(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({
      status: "Failed",
      message: "User is already logged out",
    });
  }

  await tokenBlackListModel.create({
      token: token
    })
  
  res.clearCookie("token")

  return res.status(200).json({
      status: "Success",
      message: "User Logged out Successfully",
  });
}

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController,
};
