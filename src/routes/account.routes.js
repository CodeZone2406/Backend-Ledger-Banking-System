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
 */
router.post("/", authMiddleware.authMiddleware, createAccountController);

/**
 * - GET /api/accounts/
 * Fetches all accounts belonging to the authenticated user. This route is
 * protected by authentication and responds with 200 and the account list.
 */
router.get("/", authMiddleware.authMiddleware, getUserAccountsController);

/**
 * GET /api/accounts/balance/:accountId
 *
 * Fetches the balance of the specified account if it belongs to the
 * authenticated user. This route is protected by authentication, responds
 * with 200 and the account ID and balance, or 404 if the account is not found
 * or does not belong to that user.
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, getAccountBalanceController)

module.exports = router;
