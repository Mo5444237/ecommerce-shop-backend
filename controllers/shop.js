const { validationResult } = require("express-validator");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Cart = require("../models/cart");

const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.getProducts = async (req, res, next) => {
  const queryObject = {};
  const filters = req.query;

  if (filters.category) queryObject.category = filters.category;

  if (filters.subCategory) queryObject.subCategory = filters.subCategory;

  if (filters.tags) queryObject.tags = { $in: [filters.tags] };

  if (filters.minPrice) {
    queryObject.price = queryObject.price ?? {};
    queryObject.price.$gte = parseFloat(filters.minPrice);
  }

  if (filters.maxPrice) {
    queryObject.price = queryObject.price ?? {};
    queryObject.price.$lte = parseFloat(filters.maxPrice);
  }

  if (filters.color) queryObject["colors.name"] = filters.color;

  if (filters.size) queryObject.sizes = { $in: [filters.size] };

  if (filters.searchBy)
    queryObject.$or = [
      { name: { $regex: filters.searchBy, $options: "i" } },
      { description: { $regex: filters.searchBy, $options: "i" } },
    ];

  const sortBy = filters.sortBy || "createdAt";

  const page = parseInt(filters.page, 10) || 1;
  const pageSize = parseInt(filters.pageSize, 10) || 10;
  const skip = (page - 1) * pageSize;

  try {
    const totalNumberOfProducts = await Product.countDocuments(queryObject);
    const numberOfPages = Math.ceil(totalNumberOfProducts / pageSize);
    const products = await Product.find(queryObject)
      .sort(sortBy)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      products,
      totalNumberOfProducts,
      numberOfPages,
      currentPage: page,
    });
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
