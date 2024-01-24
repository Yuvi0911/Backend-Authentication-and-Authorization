const express = require("express");
const { getAllProducts,createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview } = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles  } = require("../middleware/auth");

const router = express.Router();

// request to get all products from database
router.route("/products").get(getAllProducts)

//request to create new product
router.route("/admin/product/new").post(isAuthenticatedUser, authorizeRoles("admin"), createProduct)

//request to update product
router.route("/admin/product/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct).delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct)

//request to get product details
router.route("/product/:id").get(getProductDetails)

router.route("/review").put(isAuthenticatedUser, createProductReview)

router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteReview)

module.exports = router;