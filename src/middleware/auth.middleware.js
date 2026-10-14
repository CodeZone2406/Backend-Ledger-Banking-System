const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

/**
 * Authenticate the incoming request by validating the JWT and attaching the user to the request.
 *
 * @async
 * @param {import('express').Request} req - Express request object containing the authorization token.
 * @param {import('express').Response} res - Express response object used to send auth errors.
 * @param {import('express').NextFunction} next - Callback to continue to the next middleware or route.
 * @returns {Promise<void|import('express').Response>} Resolves by calling next() when the token is valid, or responds with 401 when unauthorized.
 */
async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authrorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
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

async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authrorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
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
