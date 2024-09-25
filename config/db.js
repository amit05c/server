
const mongoose= require("mongoose")
require('dotenv').config()
const connecection= mongoose.connect(process.env.MONGO_URL)

module.exports={
    connecection
}
