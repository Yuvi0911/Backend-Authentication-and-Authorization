const Order = require("../models/orderModel")
const Product = require("../models/productModel")
const ErrorHander = require("../utils/errorhander")
const User = require("../models/userModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

exports.newOrder = catchAsyncErrors(async(req,res,next)=>{
    const {shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice} = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id,
    });

    res.status(201).json({
        success:true,
        order,
    })
})

// Get single order
exports.getSingleOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
        //populate method ki help se database me user me jo object_id store h us id pr ja kr us user ka name aur email le lega
    );

    if(!order){
        return next(new ErrorHander("Order not found with this id",404));
    }

    res.status(200).json({
        success:true,
        order,
    })

})
// Get logged in user orders
exports.myOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find({user : req.user._id})

    res.status(200).json({
        success:true,
        orders,
    })

})

//Get all orders -- admin
exports.getAllOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find();

    let totalAmount = 0;
    
    orders.forEach((order)=>{
        totalAmount += order.totalPrice;
    })

    res.status(200).json({
        success:true,
        totalAmount,
        orders,
    })

})

//Update order status -- admin
exports.updateOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHander("order not found with this id",404));
    }

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHander("You have already delivered this order", 400))
    }

    order.orderItems.forEach(async o=>{
        await updateStock(o.product,o.quantity);
    })
    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });
    
    res.status(200).json({
        success:true,
    })

})

async function updateStock(id,quantity){
    const product = await Product.findById(id);

    product.Stocks -= quantity;

    await product.save({validateBeforeSave:false})
}

//delete order -- admin
exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHander("order not found with this id",404));
    }

    //await order.remove()
    await order.deleteOne();

    res.status(200).json({
        success:true,
    })
})