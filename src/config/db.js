const mongoose = require("mongoose")

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