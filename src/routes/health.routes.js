const { Router } = require("express");
const mongoose = require("mongoose");

const router = Router();

/**
 * Reports whether the application is ready to serve requests that require
 * MongoDB. Returns HTTP 200 when MongoDB is connected and 503 otherwise.
 *
 * @param {import("express").Request} req Express request.
 * @param {import("express").Response} res Express response.
 * @returns {import("express").Response} Health status response.
 */
function getHealth(req, res) {
  const isDatabaseConnected = mongoose.connection.readyState === 1;

  return res.status(isDatabaseConnected ? 200 : 503).json({
    status: isDatabaseConnected ? "healthy" : "unhealthy",
    database: isDatabaseConnected ? "connected" : "unavailable",
  });
}

/**
 * GET /health
 *
 * Public readiness check. Reports HTTP 200 when MongoDB is connected or 503
 * when it is unavailable.
 *
 * @swagger
 * /health:
 *   get:
 *     summary: Check application readiness
 *     tags: [Health]
 *     responses:
 *       '200':
 *         description: The application is ready to serve database-backed requests.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       '503':
 *         description: The application is not ready because MongoDB is unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get("/", getHealth);

module.exports = router;
