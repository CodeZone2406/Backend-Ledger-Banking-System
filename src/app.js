const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();

/**
 * Configures request middleware to parse JSON bodies and cookies, and to log
 * HTTP requests using Morgan's development format.
 */
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

/**
 * API routers for authentication, account management, and transactions.
 */
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRouter = require("./routes/transaction.routes");

/**
 * Mounts each API router under its corresponding URL prefix:
 * - `/api/auth` for registration, login, and logout
 * - `/api/accounts` for account management
 * - `/api/transactions` for account transfers and initial funding
 */
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);

module.exports = app;
