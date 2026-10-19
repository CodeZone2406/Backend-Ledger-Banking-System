const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController
} = require("../controllers/account.controller");

const router = express.Router();

/**
 * POST /api/accounts
 *
 * Creates an account for the authenticated user. The account is associated
 * with the current user and uses the schema defaults for its initial status
 * and currency. No request body is required. The request must pass through
 * authentication; success responds with 201 and the created account.
 *
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create a bank account
 *     tags: [Accounts]
 *     security:
 *       - tokenCookie: []
 *     responses:
 *       '201':
 *         description: Account created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountResponse'
 *       '401':
 *         description: Missing, invalid, or blacklisted token.
 */
router.post("/", authMiddleware.authMiddleware, createAccountController);

/**
 * - GET /api/accounts/
 * Fetches all accounts belonging to the authenticated user. This route is
 * protected by authentication and responds with 200 and the account list.
 *
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: List the authenticated user's accounts
 *     tags: [Accounts]
 *     security:
 *       - tokenCookie: []
 *     responses:
 *       '200':
 *         description: Accounts fetched.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountsResponse'
 *       '401':
 *         description: Missing, invalid, or blacklisted token.
 */
router.get("/", authMiddleware.authMiddleware, getUserAccountsController);

/**
 * GET /api/accounts/balance/:accountId
 *
 * Fetches the balance of the specified account if it belongs to the
 * authenticated user. This route is protected by authentication, responds
 * with 200 and the account ID and balance, or 404 if the account is not found
 * or does not belong to that user.
 *
 * @swagger
 * /api/accounts/balance/{accountId}:
 *   get:
 *     summary: Get an account balance
 *     tags: [Accounts]
 *     security:
 *       - tokenCookie: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the account owned by the authenticated user.
 *     responses:
 *       '200':
 *         description: Account balance fetched.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BalanceResponse'
 *       '401':
 *         description: Missing, invalid, or blacklisted token.
 *       '404':
 *         description: Account not found for the authenticated user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, getAccountBalanceController)

module.exports = router;
