const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },

  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      color: { type: String, required: true },
      size: { type: String, required: true },
      quantity: { type: Number, default: 1 },
    },
  ],
  totalQuantity: {
    type: Number,
    default: 0,
  },
});

cartSchema.methods.addToCart = function (productId, quantity, color, size) {
  if (this.items === undefined) {
    this.items = [];
    this.totalQuantity = 0;
  }
  const productIndex = this.items.findIndex((cp) => {
    return (
      cp.productId.toString() === productId.toString() &&
      cp.color === color &&
      cp.size === size
    );
  });
  const updatedCartItems = [...this.items];
  // if item with choosen color and size already exist increase its quantity
  if (productIndex >= 0) {
    updatedCartItems[productIndex].quantity += quantity;
  } else {
    // or add that new item
    updatedCartItems.push({
      productId,
      quantity,
      color,
      size,
    });
  }

  this.items = updatedCartItems;
  this.totalQuantity += quantity;
  return this.save();
};

cartSchema.methods.removeFromCart = function (cartItemId) {
  // find the item index and decrease its quantity from total
  const cartItemIndex = this.items.findIndex(
    (item) => item._id.toString() === cartItemId.toString()
  );

  if (cartItemIndex >= 0) {
    const itemQuantity = this.items[cartItemIndex].quantity;
    this.totalQuantity -= itemQuantity;
    // remove the item from cart
    const updatedCartItems = this.items.filter((cp) => {
      return cp._id.toString() !== cartItemId.toString();
    });

    this.items = updatedCartItems;
    return this.save();
  }
  throw Error("Could not delete the item");
};

cartSchema.methods.decreaseFromCart = function (cartItemId) {
  const itemToUpdateIndex = this.items.findIndex(
    (item) => item._id.toString() === cartItemId.toString()
  );
  const itemToUpdate = this.items[itemToUpdateIndex];

  // if item quantity is only one remove it
  if (itemToUpdate.quantity === 1) {
    const updatedCartItems = this.items.filter((cp) => {
      return cp._id.toString() !== cartItemId.toString();
    });

    this.items = updatedCartItems;
  } else {
    // else decrease its quantity by one
    this.items[itemToUpdateIndex].quantity -= 1;
  }
  this.totalQuantity -= 1;
  return this.save();
};

cartSchema.methods.getTotalPrice = function (products) {
  let total = 0;
  products.forEach((p) => (total += p.productId.price * p.quantity));
  return total;
};

cartSchema.methods.clearCart = function () {
  this.items = [];
  this.totalQuantity = 0;
  return this.save();
};

module.exports = mongoose.model("Cart", cartSchema);
