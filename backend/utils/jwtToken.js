//Creating token and saving in cookie
//Token ko cookie me store kare ge
const sendToken = (user, statusCode, res)=>{
    const token = user.getJWTToken();

    //options for cookie
    const options ={
        expires: new Date(
            Date.now() +process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly:true,
    }

    res.status(statusCode).cookie("token",token,options).json({
        uses:true,
        user,
        token,
    })
}

module.exports = sendToken