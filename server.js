require("dotenv").config()

const app = require("./src/app")
const connectDB = require("./src/config/db")

/**
 * Starts the application by loading environment variables, initiating the
 * database connection, and listening for HTTP requests on the configured
 * `PORT` or port 3000 when no port is configured.
 * The server begins listening without waiting for the database connection to
 * complete.
 */
connectDB()
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on PORT ${port}`)
})
