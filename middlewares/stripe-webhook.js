const { createOrder } = require('../controllers/shop');

const stripe = require("stripe")(process.env.STRIPE_SECRET); 
 
module.exports = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(event);
    if (event.type === "checkout.session.completed") {
      createOrder(event.data.object);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

