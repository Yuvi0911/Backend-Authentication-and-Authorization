//ye file hamne error ko handle krne k liye bnai h. Ham jo productController file me baar baar if ki condition de rhe the us 
//se bachne k liye hamne ye file banai h.  

//hamare paas Error class hoti h jis se ErrorHander inherits ho rhi h
class ErrorHander extends Error{
    constructor(message,statusCode){
        //super method se hum parent class(Error) k constructor ko call kr skte h
        super(message);
        //constructor k statusCode me hum statusCode daal de ge
        this.statusCode = statusCode

        //Error class k ander captureStackTrace naam ka method hota h jisme hume target object aur constructor dena hota h
        Error.captureStackTrace(this,this.constructor);
    }
}

module.exports = ErrorHander