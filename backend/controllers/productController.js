const Product = require("../models/productModel")
const ErrorHander = require("../utils/errorhander")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");


//catchAsyncErrors me wrap krne se hamara function catchAsyncErrors vali file me chla jaiye ga aur us file me hamne try-catch ka
//logic likha hua h, us try catch me ye function aa jaiyege


exports.createProduct = catchAsyncErrors(async (req, res, next)=>{
    
    req.body.user = req.user.id;

    const product = await Product.create(req.body);
    res.status(201).json({
        success : true,
        product
    })
}
)

//get all products from database
exports.getAllProducts =catchAsyncErrors( async(req, res)=>{

    // 1 page pr hum sirf 5 hi product dikhaye ge
    const resultPerPage = 5;

    //total kitne products h ye count kr k btaiye ga ye function
    const productCount = await Product.countDocuments();

    //yadi hame koi special product search krna h jese ki shoes, t-shirt, chocolate, etc.
    const apiFeature = new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage);
    const products = await apiFeature.query;

    //    const products =await Product.find();

     res.status(201).json({
        success : true,
        products,
        productCount,
    })
}
)

//get product details

exports.getProductDetails =catchAsyncErrors( async(req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        //hamne utils me ErrorHander ki class bna di jisse ab hame baar baar if ki condition likne ki jrurt nhi h
         /*return res.status(500).json({
            success:false,
            message:"product not found"
        })*/

        //next ki help se hum interpretor ko directly ErrorHander vali file pe le jaiye ge
        return next(new ErrorHander("Product not found",404))
    }
    res.status(200).json({
        success:true,
        product
    })
}
)

//update Product by admin

exports.updateProduct = catchAsyncErrors(async (req,res,next)=>{
    let product = await Product.findById(req.params.id);
    if(!product){
     return res.status(500).json({
        success:false,
        message:"product not found"
     })
    }
    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        success:true,
        product
    })
}
)

//delete product

exports.deleteProduct = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success:false,
            message:"product not found"
         })
    }
    
    await product.deleteOne();

    res.status(200).json({
        success:true,
        message:"product deleted successfully"
    })
}
)

//Create new review or update the review of the product

exports.createProductReview = catchAsyncErrors(async(req, res, next)=>{

    const {rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name:req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString())
    if(isReviewed){
        product.reviews.forEach((rev) => {
            if(rev.user.toString() === req.user._id.toString())
            (rev.rating = rating),
            (rev.comment = comment)
        })
    }
    else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    //jitne bhi reviews h unke average nikal lege
    //4,5,5,2. avg=16/4=4
    
    let avg=0;

    product.reviews.forEach((rev)=>{
        avg+=rev.rating
    })
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave : false})

    res.status(200).json({
        success:true,
    })
})

//Get all reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) =>{
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHander("Product not found", 404))
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    })
})

//Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next)=>{
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHander("Product not find", 404))
    }

    const reviews = product.reviews.filter( (rev) => rev._id.toString() !== req.query.id.toString())

    let avg=0;

    reviews.forEach((rev)=>{
        avg+=rev.rating
    })
    const ratings = avg / reviews.length;

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews,
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true
    })

})