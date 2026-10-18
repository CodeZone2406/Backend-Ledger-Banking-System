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
 * and currency. No request body is required.
 */
router.post("/", authMiddleware.authMiddleware, createAccountController);

/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
router.get("/", authMiddleware.authMiddleware, getUserAccountsController);

/**
 * - GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, getAccountBalanceController)

module.exports = router;
