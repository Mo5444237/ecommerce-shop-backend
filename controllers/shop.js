const { validationResult } = require("express-validator");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Cart = require('../models/cart');

const stripe = require("stripe")(process.env.STRIPE_SECRET); 


exports.getProducts = async (req, res, next) => {
    const query = Product.find();
    if (req.query.category) {
        query.where("category").equals(req.query.category);
    }
    if (req.query.subcategory) {
        query.where("subcategory").equals(req.query.subcategory);
    }
    if (req.query.minPrice) {
        query.where("price").gte(req.query.minPrice);
    }
    if (req.query.maxPrice) {
        query.where("price").lte(req.query.maxPrice);
    }
    try {
        const products = await query.exec();
        res.status(200).json({ products: products });
    } catch (error) {
        next(error);
    }
};

exports.getProductDetails = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ product: product });
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  const userId = req.userId;
  try {
    let cart = await Cart.findOne({ userId: userId }).populate(
      "items.productId"
    );
    if (!cart) {
      cart = await Cart.create({
        userId: userId,
        items: [],
      });
    }
    const items = cart.items;
    const totalQuantity = cart.totalQuantity;
    res.status(200).json({ items: items, totalQuantity: totalQuantity });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  const productId = req.body.productId;
  const color = req.body.color;
  const size = req.body.size;
  const quantity = req.body.quantity || 1;
  const userId = req.userId;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid data");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    const cart = await Cart.findOne({ userId: userId });
    await cart.addToCart(productId, quantity, color, size);

    res.status(201).json({
      message: "product added to cart",
    });
  } catch (error) {
    next(error);
  }
};

exports.decreaseFromCart = async (req, res, next) => {
  const userId = req.userId;
  const cartItemId = req.body.productId;

  try {
    const cart = await Cart.findOne({ userId: userId });
    await cart.decreaseFromCart(cartItemId);

    res.status(200).json({ message: "Item quantity decreased successfully" });
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  const userId = req.userId;
  const cartItemId = req.body.productId;
  try {
    const cart = await Cart.findOne({ userId: userId });
    await cart.removeFromCart(cartItemId);

    res.status(200).json({
      message: "Product deleted from cart",
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.userId });
    if (!orders) {
      const error = new Error("No orders were found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ orders: orders });
  } catch (error) {
    next(error);
  }
};

exports.orderDetails = async (req, res, next) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.find({ _id: orderId, userId: req.userId });
    if (!order) {
      const error = new Error("No order found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ order: order });
  } catch (error) {
    next(error);
  }
};

exports.createCheckoutSession = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    const cart = await Cart.findOne({ userId: userId }).populate(
      "items.productId"
    );
    const totalPrice = cart.getTotalPrice(cart.items);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            product_data: {
              name: user.name,
            },
            unit_amount: totalPrice * 100,
            currency: "egp",
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}/orders`,
      cancel_url: `${req.protocol}://${req.get("host")}/cart`,
      customer_email: user.email,
      client_reference_id: cart._id.toString(),
      metadata: req.body.shippingAddress,
    });
    res.status(200).json({ session });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const oderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId).populate("items.productId");
  const user = await User.findOne({ email: session.customer_email });

  const order = await Order.create({
    userId: user._id,
    items: cart.items,
    totalPrice: oderPrice,
    shippingAddress,
    orderedAt: Date.now(),
    isPaid: true,
  });

  if (order) {
    await cart.clearCart();
  }
};


