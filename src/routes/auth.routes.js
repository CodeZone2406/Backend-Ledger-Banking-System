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
 *
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User created; JWT is returned and set in the token cookie.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '422':
 *         description: A user is already registered with this email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Registration or email delivery failed.
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
 *
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login successful; JWT is returned and set in the token cookie.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '401':
 *         description: Email or password is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Login could not be completed.
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
 *
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out
 *     tags: [Authentication]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional bearer token; the token cookie can also be used.
 *     responses:
 *       '200':
 *         description: Token blacklisted and cookie cleared.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '400':
 *         description: No token was provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Token could not be blacklisted.
 */
router.post("/logout", authController.userLogoutController)

module.exports = router;