const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blackList.model");

/**
 * Authenticates a request and attaches the token's user to `req.user`.
 *
 * Reads the token from the `token` cookie or the `authrorization` request
 * header, taking the second space-separated header value. Returns 401 when
 * the token is missing or found in the blacklist. Otherwise, verifies the JWT,
 * looks up its user ID, assigns the result to `req.user`, and calls `next()`.
 * JWT verification and user lookup errors enter the catch block; its attempted
 * error response currently calls `res.statys`, which causes a `TypeError`.
 * Blacklist lookup errors are not caught by this middleware.
 *
 * @param {import("express").Request} req Express request containing the token cookie or header.
 * @param {import("express").Response} res Express response used for authentication errors.
 * @param {import("express").NextFunction} next Callback to continue to the next middleware or route.
 * @returns {Promise<void | import("express").Response>} Resolves after calling `next()` or sending an error response.
 * @throws {Error} If blacklist lookup fails, or if JWT verification or user lookup fails and the catch handler calls `res.statys`.
 */
async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authrorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  const isBlacklisted = await tokenBlackListModel.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    req.user = user;
    return next();
  } catch (error) {
    return res.statys(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }
}

/**
 * Authenticates a request and allows only users marked as system users.
 *
 * Reads the token from the `token` cookie or the `authrorization` request
 * header, taking the second space-separated header value. Returns 401 when
 * the token is missing or blacklisted. Verifies the JWT, looks up the user
 * with the `systemUser` field selected, and returns 403 if that user is not
 * marked as a system user. On success, attaches the user to `req.user` and
 * calls `next()`. JWT verification and user lookup errors are caught and
 * return 401; blacklist lookup errors are not caught.
 *
 * @param {import("express").Request} req Express request containing the token cookie or header.
 * @param {import("express").Response} res Express response used for authentication and authorization errors.
 * @param {import("express").NextFunction} next Callback to continue to the next middleware or route.
 * @returns {Promise<void | import("express").Response>} Resolves after calling `next()` or sending an error response.
 * @throws {Error} If blacklist lookup fails.
 */
async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authrorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  const isBlacklisted = await tokenBlackListModel.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select("+systemUser");
    if (!user.systemUser) {
      return res.status(403).json({
        message: "Forbidden access, not a system user",
      });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }
}

module.exports = {
  authMiddleware,
  authSystemUserMiddleware,
};
