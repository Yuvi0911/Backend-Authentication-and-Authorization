const ErrorHander = require("../utils/errorhander")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto")

//Register a user
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password} = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:"this is a sample id",
            url:"profilepicUrl"
        }
    })
  //const token = user.getJWTToken();

  //res.status(201).json({
  //    success:true,
  //    token,
  //})
  
  sendToken(user,201,res);
})

//Login user
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const {email,password} = req.body;

    // check kre ge ki user ne email aur password dono enter kiye h ya nhi 

    if(!email || !password){
        return next(new ErrorHander("Please enter email and password",400));
    }

    //yadi user ne password aur email dono diye h toh hum find kre ge ki us email aur password ka koi user h ya nhi
    const user = await User.findOne({email}).select("+password");
    //humne ye .select("+password") isliye kiya h kyoki hum userModel me password ko select:false kr rkha tha

    //yadi user ka password aur email find nhi hota toh hum error send krdege
    if(!user){
        return next(new ErrorHander("invalid email or password",401))
    }

    //hum 1 method bnaye ge comparePassword(), jo user ne password diya h ushe database m jo password store h usse match krega 
    //ydi password match ho jaiye ge toh ye true return kr dega nhi toh ye false return krdega
    const isPasswordMatched = await user.comparePassword(password);
    
    //yadi user ne jo password diya h vo original password se match nhi krta toh hum ushe directly bhi bta skte h ki invalid password
    // pr ye risky hota h isliye hum ushe directly invalid password nhi btaiye ge
    if(!isPasswordMatched){
        return next(new ErrorHander("Invalid email or password",401))
    }

    //const token = user.getJWTToken();

    //res.status(200).json({
    //    success:true,
    //    token,
    //})
    
    sendToken(user,200,res);
})

//Logout User

exports.logout = catchAsyncErrors(async(req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    })

    res.status(200).json({
        success:true,
        message:"Logged Out",
    })
})

// Forget Password
exports.forgetPassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorHander("User not found", 404))
    }

    //Get ResetPassword Token -> userModel.js me 1 function h jo reset password ka token generate kr k de ga jo ki validate hoga 15 min k liye
     const resetToken = user.hi();       //hi() => getResetPasswordToken()
   

    await user.save({validateBeforeSave: false});

    //user jab forget password kre ga toh us k paas 1 email jaiye gi jisme ye link hoga jis pr vo jaa kr apna password change kr skhe ga
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    //email me hum ek message bheje ge
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this emailthen, please ignore it `;

    try{
        
        await sendEmail({
            email:user.email,
            subject: `Ecommerce Password recovery`,
            message
        });
        res.status(200).json({
            success:true,
            message:'Email sent to ${user.email} successfully',
        })
    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHander(error.message, 500))
    }
})

//Reset password
exports.resetPassword =catchAsyncErrors(async(req,res,next)=>{
    
    //creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt:Date.now()},
    })

    //yadi user na mile toh
    if(!user){
        return next(new ErrorHander("Reset password token is invalid or has been expired", 400))
    }

    //yadi password vali field confirm passwoord vali field se match na hoe
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHander("Password does not password",400))
    }

    //yadi user mil gya aur usne password aur confirm password me same password daala h toh password ko change kr dege
    user.password = req.body.password;
    //passord successfully change ho chuka h ab resetPasswordToken aur ResetPasswordExpire ko dobara undefined kr dege

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    //password change kiya h toh use login bhi krdege directly
    sendToken(user, 200, res);
})


//Get User Details -> yadi user ko apni id check krni ho toh

exports.getUserDetails = catchAsyncErrors(async(req, res, next)=>{

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    })
})

//Update User Password => user apni profile me jaa kr password change kr skta h apni profile ka

exports.UpdatePassword = catchAsyncErrors(async(req, res, next)=>{

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    
    //yadi user ne jo password diya h vo original password se match nhi krta toh hum ushe directly bta de ge ki invalid password
    if(!isPasswordMatched){
        return next(new ErrorHander("Old password is invalid",400))
    }

    //yadi new password aur confirm password match nhi krte toh hum error de dege
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHander("password does not match",400))
    }

    user.password = req.body.newPassword;

    await user.save()

   sendToken(user, 200, res)
})

//Update User name and email => user apni profile me jaa kr name and email change kr skta h 

exports.UpdateProfile = catchAsyncErrors(async(req, res, next)=>{

    const newUserData={
        name:req.body.name,
        email:req.body.email,
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success:true,
    })
})

//Admin ko dekhne h ki kitne user h
exports.getAllUser = catchAsyncErrors(async (req, res, next)=>{
    const users = await User.find();

    res.status(200).json({
        success:true,
        users,
    })
})

//Admin ko kisi user ki details dekhni ho
exports.getSingleUser = catchAsyncErrors(async (req, res, next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHander(`User does not exist with id: ${req.params.id}`))
    }

    res.status(200).json({
        success:true,
        user,
    })
})

//update User Role -> admin kisi bhi user ka role, profile change kr skta h
exports.UpdateUserRole = catchAsyncErrors(async(req, res, next)=>{

    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success:true,
    })
})

//Delete user -- admin
exports.deleteUser = catchAsyncErrors(async(req, res, next)=>{


    const user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHander(`User does not exit with id: ${req.params.id}`))
    }

    await user.deleteOne();

    res.status(200).json({
        success:true,
        message:"User Deleted Successfully"
    })
})

