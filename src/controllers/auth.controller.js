const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

/**
 * Registers a new user and returns an authentication token.
 * @param {import("express").Request<{}, any, { email: string, password: string, name: string }>} req
 * @param {import("express").Response} res
 * @returns {Promise<import("express").Response>} The registration result.
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
}

/**
 * Handles a user login request.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
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

module.exports = { userRegisterController, userLoginController };
