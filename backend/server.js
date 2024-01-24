const app = require("./app");

const dotenv = require("dotenv");
const connectToMongo = require("./config/database")

//Handling Uncaught exception -> console.log(youtube) => youtube is not defined
process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server due to uncaught exception`)
    //server ko close krne k liye or app ko crash krne k liye
    process.exit(1)
})

dotenv.config({path:"backend/config/config.env"});

connectToMongo()

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
})

//Uncaught Exception
//console.log(youtube)

//Unhandled Promise Rejection -> ydi hmare env file k data me kuch galat value aa jaiye toh hum server ko close krdege

process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to unhandled promise rejection`);

     //server ko close krne k liye or app ko crash krne k liye
    server.close(()=>{
        process.exit(1);
    })
})