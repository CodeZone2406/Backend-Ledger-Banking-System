const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailervice = require("../services/email.service");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

/**
 * Creates a transfer from the requested source account to the destination.
 *
 * The request body must include `fromAccount`, `toAccount`, `amount`, and
 * `idempotencyKey`; each value is checked for presence. Both account records
 * must exist and be active, and the source account must have enough
 * ledger-derived balance. Existing idempotency keys return a response based
 * on the transaction's `COMPLETED`, `PENDING`, `FAILED`, or `REVERSED` status.
 * A new transfer creates a pending transaction and debit and credit ledger
 * entries in a database transaction, marks the transaction completed, and
 * sends a notification to the authenticated user after committing. Processing
 * pauses for 15 seconds between creating the debit and credit entries.
 *
 * Account lookup checks that the account IDs exist but does not verify that
 * either account belongs to the authenticated user. Transaction-processing
 * errors are returned as a 400 response; notification errors occur after the
 * database transaction has committed and are not caught here.
 *
 * @param {import("express").Request} req Authenticated request with transfer details in `body`.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<import("express").Response|void>} The transfer result or an error response.
 * @throws {Error} If account lookup, balance retrieval, or notification sending fails.
 */
async function createTransaction(req, res) {
  /**
   * 1. Validate Request
   */

  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message:
        "FromAccount, toAccount, amount, and idempotencyKey are required",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
    });
  }

  /**
   * 2. Validate idempotency key
   */

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        status: "Success",
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        status: "Pending",
        message: "Transaction is still processing",
      });
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        status: "Failed",
        message: "Transaction processing failed, please retry",
      });
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        status: "Reversed",
        message: "Transaction was reversed, please retry",
      });
    }
  }

  /**
   * 3. Check Account Status
   */

  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be ACTIVE process transaction",
    });
  }

  /**
   * 4. Derive sender balance from ledger
   */

  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      status: "Failed",
      message: `Insufficient Balance. Current balance is ${balance}. Requested amount is ${amount}`,
    });
  }

  let transaction;
  try {
    /**
     * 5. Create a transaction entry (PENDING)
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING",
          },
        ],
        { session },
      )
    )[0];

    // await transaction.save({ session });
    console.log("transaction id:", transaction?._id);

    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    await (() => {
      return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    })();

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    return res.status(400).json({
      status: "Failed",
      message:
        "Transaction is Pending due to some issue, please retry after sometime",
    });
  }

  /**
   * 10. Send Email Notification
   */

  await emailervice.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );

  return res.status(201).json({
    status: "Success",
    message: "Transaction completed successfully",
    transaction: transaction,
  });
}

/**
 * Records an initial-funds transfer from the authenticated system user's
 * account to the destination account.
 *
 * The request body must include `toAccount`, `amount`, and `idempotencyKey`.
 * Each value is checked for presence. The destination account and an account
 * associated with the authenticated system user must exist. The idempotency
 * key is stored with the transaction but is not checked for prior use.
 * The transaction creates debit and credit ledger entries and marks the
 * transaction completed in a database transaction. Unlike
 * `createTransaction`, this handler does not check account status or verify
 * that the source account has sufficient balance.
 *
 * @param {import("express").Request} req Authenticated system-user request with funding details in `body`.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<import("express").Response>} The initial-funds transaction result or an error response.
 * @throws {Error} If account lookup, transaction creation, ledger writes, or database transaction operations fail.
 */
async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount, and idempotencyKey are required",
    });
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System user account not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  });

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction,
  });
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};
