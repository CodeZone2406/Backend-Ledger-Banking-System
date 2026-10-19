require("dotenv").config()

const app = require("./src/app")
const connectDB = require("./src/config/db")

/**
 * Starts the application by loading environment variables, initiating the
 * database connection, and listening for HTTP requests on port 3000.
 * The server begins listening without waiting for the database connection to
 * complete.
 */
connectDB()
app.listen(3000, () => {
    console.log(`Server is running on PORT 3000`)
})
