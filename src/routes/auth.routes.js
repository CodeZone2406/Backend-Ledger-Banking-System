const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

/**
 * Register a new user account.
 *
 * @route POST /api/auth/register
 * @param {import('express').Request} req - Express request object containing the new user payload.
 * @param {import('express').Response} res - Express response object used to return the registration result.
 */
router.post("/register", authController.userRegisterController);

/**
 * Log in an existing user and issue an authentication token.
 *
 * @route POST /api/auth/login
 * @param {import('express').Request} req - Express request object containing the login credentials.
 * @param {import('express').Response} res - Express response object used to return the login result.
 */
router.post("/login", authController.userLoginController);


/**
 * - POST /api/auth/logout
 */
router.post("/logout", authController.userLogoutController)

module.exports = router;