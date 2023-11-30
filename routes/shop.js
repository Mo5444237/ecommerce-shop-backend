const express = require("express");
const router = express.Router();

const isAuth = require("../middlewares/is-auth");

const {
  getProducts,
  getProductDetails,
  getCart,
  addToCart,
  decreaseFromCart,
  removeFromCart,
  getOrders,
  orderDetails,
  createCheckoutSession,
} = require("../controllers/shop");

const { addToCartValidation } = require("../validation/shop");

// products routes
router.get("/products", getProducts);
router.get("/product/:productId", getProductDetails);

// check if user is authenticated
router.use(isAuth);

// cart routes
router.get("/cart", getCart);
router.post("/cart", addToCartValidation, addToCart);
router.patch("/cart", decreaseFromCart);
router.delete("/cart", removeFromCart);

// orders routes
router.get("/orders", getOrders);
router.get("/orders/:orderId", orderDetails);
router.post("/checkout", createCheckoutSession);

module.exports = router;
