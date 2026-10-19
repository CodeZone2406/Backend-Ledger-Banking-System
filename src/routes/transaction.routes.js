const { Router } = require("express");
const transactionRoutes = Router();
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

/**
 * POST /api/transactions
 *
 * Creates a transfer between two accounts. Requires an authenticated user.
 * The request body must contain `fromAccount`, `toAccount`, `amount`, and
 * `idempotencyKey`. The route uses standard authentication middleware.
 * Responds with 201 when a transfer is completed, 200 when the idempotency
 * key matches a completed or pending transaction, 400 for invalid account
 * details, inactive accounts, insufficient funds, or a processing error, and
 * 500 when a matching transaction has failed or been reversed.
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
 * `amount`, and `idempotencyKey`. The route uses system-user authentication.
 * Responds with 201 when the transfer is completed or 400 if the destination
 * or system-user account cannot be found, or required request values are
 * missing. The idempotency key is not checked for prior use.
 */
transactionRoutes.post(
  "/system/initial-funds",
  authMiddleware.authSystemUserMiddleware,
  transactionController.createInitialFundsTransaction,
);

module.exports = transactionRoutes;
