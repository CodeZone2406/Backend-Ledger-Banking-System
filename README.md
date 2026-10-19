# Backend Ledger Banking System

A high-concurrency core banking backend featuring double-entry ledger accounting, atomic fund transfers, and ACID-compliant transaction processing.

---

## 🚀 Live Deployment
* **Live API URL:** https://backend-ledger-banking-system-3tlz.onrender.com

---

## 📚 API Documentation
* **Swagger UI:** Once the server is running locally or via your Render deployment, open `/api-docs` (e.g., `https://backend-ledger-banking-system-3tlz.onrender.com/api-docs/#/`) for the interactive Swagger UI.
* It fully documents the **authentication**, **account**, and **transaction** endpoints. 
* **Authentication:** Protected endpoints use the secure token cookie set automatically upon registration and login.

---

## 🩺 Health Check
* **Endpoint:** `GET /health`
* **Responses:**
  * `200 OK`: Returned when MongoDB is successfully connected.
  * `503 Service Unavailable`: Returned when the database connection is unavailable.

---

## 🛠️ Getting Started

1. **Install dependencies:**
   ```bash
   npm install
