const mongoose = require("mongoose")

/**
 * Starts a MongoDB connection using the `MONGODB_URI` environment variable.
 *
 * Logs a message when the connection succeeds. If the connection fails, logs
 * the error and exits the process with status code 1. The connection promise
 * is handled internally and is not returned.
 *
 * @returns {void}
 */
function connectDB(){
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("server is connected to DB")
    }).catch(err => {
        console.log(`Error occurred while connecting to DB : ${err}`)
        process.exit(1)
    })
}

module.exports = connectDB