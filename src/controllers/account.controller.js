const accountModel = require("../models/account.model");

/**
 * Creates a bank account for the authenticated user.
 *
 * Responds with 201 and the created account.
 *
 * @param {import("express").Request} req
 *   Express request with the authenticated user attached by the auth middleware.
 * @param {import("express").Response} res
 *   Express response used to return the created account.
 * @returns {Promise<import("express").Response>}
 *   Resolves with the account creation response.
 * @throws {Error} If account creation fails.
 */
async function createAccountController(req, res) {
  const user = req.user;

  const account = await accountModel.create({
    user: user._id,
  });

  res.status(201).json({
    status: "Success",
    message: "Account Created Successfully",
    account,
  });
}

/**
 * Fetches all accounts belonging to the authenticated user.
 *
 * Responds with 200 and the matching accounts.
 *
 * @param {import("express").Request} req
 *   Express request with the authenticated user attached by the auth middleware.
 * @param {import("express").Response} res
 *   Express response used to return the accounts.
 * @returns {Promise<void>} Resolves after sending the account list response.
 * @throws {Error} If fetching the user's accounts fails.
 */
async function getUserAccountsController(req, res) {
  const accounts = await accountModel.find({ user: req.user._id });

  res.status(200).json({
    status: "Success",
    message: "Account Fetched Successfully",
    accounts,
  });
}

/**
 * Fetches the balance of an account owned by the authenticated user.
 *
 * Responds with 404 if the account is not found, or 200 with its balance.
 *
 * @param {import("express").Request<{ accountId: string }>} req
 *   Express request containing the account ID and authenticated user.
 * @param {import("express").Response} res
 *   Express response used to return the account balance or not-found error.
 * @returns {Promise<void | import("express").Response>}
 *   Resolves after sending the response.
 * @throws {Error} If looking up the account or calculating its balance fails.
 */
async function getAccountBalanceController(req, res) {
  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id,
  });

  if (!account) {
    return res.status(404).json({
      status: "Failed",
      message: "Account not found",
    });
  }

  const balance = await account.getBalance();

  res.status(200).json({
    status: "Success",
    message: "Balance fetched successfully",
    accountId: account._id,
    balance: balance,
  });
}

module.exports = {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController,
};
