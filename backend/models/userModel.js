const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"],
        maxLength:[30,"Name cannot exceed 30 characters"],
        minLength:[4,"Name should have more than 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email"]
    },
    password:{
        type:String,
        minLength:[8,"Password should be greater than 8 characters"],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

//jab bhi hum userSchema ko database me save kre ge us se phle hum password ko encrypt krde ge bcryptjs ki help se
userSchema.pre("save",async function(next){
    //hum arrow function k ander this keyword use nhi kr skte isliye hum ishe simple function bnaye ge

    //yadi keval profile ko update krte h aur password ko change nhi krte toh hum password ko encrypt nhi krege 
    if(!this.isModified("password")){
        next();
    }

    //hum password ko tabhi hash krege yadi vo modified ya update hua h ya kisi naye user ne password bnaya h
    //ye password ko encrypt kr dega
    this.password = await bcryptjs.hash(this.password,10)
});

//JWT TOKEN -> iski help se hum user ko authenticate kr skte h ki vo routes ko access kr skta h ya nhi 
//hum jwt token ko generate kr k cookies me store kr lege
userSchema.methods.getJWTToken = function () {
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        //jab jwt token expire ho jaiye ga tab user apne aap logout ho jaiye ga apne account se
        expiresIn: process.env.JWT_EXPIRE,
    })
}


//Compare password-> user ne jo password login krte vakt diya h ushe database me store password se match krega
userSchema.methods.comparePassword = async function(enteredPassword){
    //bcryptjs.compare ki help se hum hash password ko user k dwara diye gye password se match kr skte h
    return await bcryptjs.compare(enteredPassword,this.password)
}  

//Generating Password Reset token -> hum isme password ko reset kr skte h

userSchema.methods.hi = function () {       ////hi() => getResetPasswordToken
    
    //Generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
}


module.exports = mongoose.model("User",userSchema)