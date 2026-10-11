const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  createAccountController,
} = require("../controllers/account.controller");

const router = express.Router();

/**
 * Registers account API endpoints on the Express router.
 *
 * POST /api/accounts creates an account for the authenticated user.
 */
router.post("/", authMiddleware, createAccountController);

module.exports = router;
