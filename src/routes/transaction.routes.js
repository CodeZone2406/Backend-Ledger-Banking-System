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
 *
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Transfer funds between accounts
 *     tags: [Transactions]
 *     security:
 *       - tokenCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromAccount, toAccount, amount, idempotencyKey]
 *             properties:
 *               fromAccount:
 *                 type: string
 *               toAccount:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               idempotencyKey:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Transfer completed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       '200':
 *         description: This idempotency key was already processed or is pending.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       '400':
 *         description: Invalid request, account, status, balance, or transaction processing error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Missing, invalid, or blacklisted token.
 *       '500':
 *         description: Existing transaction failed or was reversed.
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
 *
 * @swagger
 * /api/transactions/system/initial-funds:
 *   post:
 *     summary: Transfer initial funds from the system account
 *     tags: [Transactions]
 *     security:
 *       - tokenCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [toAccount, amount, idempotencyKey]
 *             properties:
 *               toAccount:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               idempotencyKey:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Initial-funds transfer completed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       '400':
 *         description: Required value or account is missing.
 *       '401':
 *         description: Missing, invalid, or blacklisted token.
 *       '403':
 *         description: Authenticated user is not a system user.
 */
transactionRoutes.post(
  "/system/initial-funds",
  authMiddleware.authSystemUserMiddleware,
  transactionController.createInitialFundsTransaction,
);

module.exports = transactionRoutes;
