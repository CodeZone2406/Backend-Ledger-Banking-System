const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

/**
 * Routers for authentication and account-related API endpoints.
 */
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");


/**
 * Mounts the authentication and account routers under their API path prefixes.
 */
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);

module.exports = app;
