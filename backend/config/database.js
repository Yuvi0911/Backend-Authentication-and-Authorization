const mongoose = require('mongoose');

const dotenv = require("dotenv");


//Unhandled Promise Rejection
//const mongoURI = "mogodb+srv://thunderyuvi911:Rajput11@cluster0.zydhdyp.mongodb.net/Ecommerce";

const mongoURI = "mongodb+srv://thunderyuvi911:Rajput11@cluster0.zydhdyp.mongodb.net/Ecommerce";

const connectToMongo = () =>{
    mongoose.connect(mongoURI)
    console.log("Connect to mongo successfully");
}

module.exports = connectToMongo;