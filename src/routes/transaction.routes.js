const { Router } = require("express");
const transactionRoutes = Router();
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

/**
 * POST /api/transactions
 *
 * Creates a transfer between two accounts. Requires an authenticated user.
 * The request body must contain `fromAccount`, `toAccount`, `amount`, and
 * `idempotencyKey`.
 */
transactionRoutes.post(
  "/",
  authMiddleware.authMiddleware,
  transactionController.createTransaction,
);

/**
 * POST /api/transactions/system/initial-funds
 *
 * Records an initial-funds transfer from the authenticated system user's
 * account to a destination account. The request body must contain `toAccount`,
 * `amount`, and `idempotencyKey`.
 */
transactionRoutes.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)

module.exports = transactionRoutes;
