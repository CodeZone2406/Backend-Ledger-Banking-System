const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

/**
 * Registers a new user account.
 *
 * POST /api/auth/register
 *
 * Accepts `email`, `password`, and `name` in the request body. Responds with
 * 422 if the email is already registered; otherwise, creates the user, sets
 * the three-day JWT in a `token` cookie, and responds with 201 and the user
 * details and token. Sends a registration email after sending the response.
 */
router.post("/register", authController.userRegisterController);

/**
 * Logs in an existing user and issues an authentication token.
 *
 * POST /api/auth/login
 *
 * Accepts `email` and `password` in the request body. Responds with 401 if
 * the email is unknown or the password is incorrect; otherwise, sets the
 * three-day JWT in a `token` cookie and responds with 200 and the user's
 * public details and token.
 */
router.post("/login", authController.userLoginController);
/**
 * Logs out the current user by blacklisting their token and clearing its cookie.
 *
 * POST /api/auth/logout
 *
 * Reads the token from the `token` cookie or `Authorization` header. Responds
 * with 400 if no token is present. Otherwise, adds the token to the blacklist,
 * clears the cookie, and responds with 200. This route does not use
 * authentication middleware.
 */
router.post("/logout", authController.userLogoutController)

module.exports = router;