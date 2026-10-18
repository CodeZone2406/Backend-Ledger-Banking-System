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
 *
 */
async function getUserAccountsController(req, res) {
  const accounts = await accountModel.find({ user: req.user._id });

  res.status(200).json({
    status: "Success",
    message: "Account Fetched Successfully",
    accounts,
  });
}

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
