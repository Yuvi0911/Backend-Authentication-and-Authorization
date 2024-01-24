const jwt = require("jsonwebtoken");
const ErrorHander = require("../utils/errorhander");
const User = require("../models/userModel");
const catchAsyncErrors = require("./catchAsyncErrors");

exports.isAuthenticatedUser = catchAsyncErrors(async(req,res,next)=>{

   // const token = req.cookies;

    //yadi hame keval token chaiye 
    const {token} = req.cookies;

   // console.log(token);

   if(!token){
    return next(new ErrorHander("Please login to access this resource",401));
   }

   const decodedData = jwt.verify(token, process.env.JWT_SECRET);

   req.user = await User.findById(decodedData.id)

   next();
})

//isme hum role k basis pr check krege ki kon product ko create, update, delete kr skta h. Sbhi user prdouct pr operations perform nhi kr skte.
exports.authorizeRoles = (...roles)=>{
    //roles array me role:admin store h
    return (req,res,next)=>{

        //req.user.role yadi user k equal h aur roles me user include nhi h toh false aa jaiye ga aur !false=true toh ye cond. chal jaiye gi aur yadi req.user.role me admin aata h toh vo roles me include h toh cond true ho jaiye gi aur !true=false 
        if(!roles.includes(req.user.role)){
           return next( new ErrorHander(
                `Role: ${req.user.role} is not allowed to access this resource`,
                403
            )
           );
        }
        next();
    }
}