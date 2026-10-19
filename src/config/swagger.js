const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Backend Ledger Banking API",
      version: "1.0.0",
      description:
        "API for user authentication, bank accounts, and ledger transactions.",
    },
    servers: [{ url: "/", description: "Current server" }],
    components: {
      securitySchemes: {
        tokenCookie: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description:
            "JWT set by the register and login endpoints. Required by protected account and transaction endpoints.",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "Failed" },
            message: { type: "string", example: "Request could not be completed" },
          },
          required: ["message"],
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "65f1a2b3c4d5e6f789012345" },
            email: { type: "string", format: "email", example: "user@example.com" },
            name: { type: "string", example: "Alex Morgan" },
          },
          required: ["_id", "email", "name"],
        },
        Account: {
          type: "object",
          properties: {
            _id: { type: "string", example: "65f1a2b3c4d5e6f789012345" },
            user: { type: "string", example: "65f1a2b3c4d5e6f789012346" },
            status: {
              type: "string",
              enum: ["ACTIVE", "FROZEN", "CLOSED"],
              example: "ACTIVE",
            },
            currency: { type: "string", example: "INR" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            _id: { type: "string", example: "65f1a2b3c4d5e6f789012347" },
            fromAccount: { type: "string", example: "65f1a2b3c4d5e6f789012345" },
            toAccount: { type: "string", example: "65f1a2b3c4d5e6f789012346" },
            amount: { type: "number", minimum: 0.01, example: 250 },
            status: {
              type: "string",
              enum: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
              example: "COMPLETED",
            },
            idempotencyKey: { type: "string", example: "transfer-2026-001" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            token: { type: "string" },
          },
        },
        AccountResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "Success" },
            message: { type: "string", example: "Account Created Successfully" },
            account: { $ref: "#/components/schemas/Account" },
          },
        },
        AccountsResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "Success" },
            message: { type: "string", example: "Account Fetched Successfully" },
            accounts: {
              type: "array",
              items: { $ref: "#/components/schemas/Account" },
            },
          },
        },
        BalanceResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "Success" },
            message: { type: "string", example: "Balance fetched successfully" },
            accountId: { type: "string" },
            balance: { type: "number" },
          },
        },
        TransactionResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "Success" },
            message: { type: "string" },
            transaction: { $ref: "#/components/schemas/Transaction" },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.js").replace(/\\/g, "/")],
};

module.exports = swaggerJsdoc(options);
