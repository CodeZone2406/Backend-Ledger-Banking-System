const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  createAccountController,
} = require("../controllers/account.controller");

const router = express.Router();

/**
 * POST /api/accounts
 *
 * Creates an account for the authenticated user. The account is associated
 * with the current user and uses the schema defaults for its initial status
 * and currency. No request body is required.
 */
router.post("/", authMiddleware, createAccountController);

module.exports = router;
