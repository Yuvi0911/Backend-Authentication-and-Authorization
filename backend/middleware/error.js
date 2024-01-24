//ye file hamne error ko handle krne k liye bnai h. Ham jo productController file me baar baar if ki condition de rhe the us 
//se bachne k liye hamne ye file banai h.  


const ErrorHandler = require("../utils/errorhander")

module.exports = (err, req, res, next) =>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //yadi hum id ki length galat de dete h thunderclient me request krte wakt toh ushe castError khte h aur ushe hum handle krege
    if(err.name === "CastError"){
      const message = `Resource not found. Invalid: ${err.path}`;
      err = new ErrorHandler(message,400)
    }

    //Mongoose duplicate key error => user yadi same email se dobara nayi id bnaye toh
    if(err.code === 11000){
      const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
      err = new ErrorHandler(message, 400)
    } 

    //yadi koi JsonWebToken galat daal deta h toh
    if(err.name === "JsonWebTokenError"){
      const message = `Json web Token is invalid, try again`;
      err = new ErrorHandler(message,400)
    }

    //JWT expire error
    if(err.name === "TokenExpiredError"){
      const message = `Json web Token is Expired, try again`;
      err = new ErrorHandler(message,400)
    }


    res.status(err.statusCode).json({
        success:false,
      //  error:err.stack
        error:err.message
    })
}