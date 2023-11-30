const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    items: [{
        productId: { type: Object, required: true },
        color: {type: String, required: true},
        size: {type: String, required: true},
        quantity: { type: Number, required: true },
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    shippingAddress: {
        address1: String,
        address2: String,
        city: String,
        postalCode: String
    },
    orderedAt: {
        type: Date,
        default: Date.now()
    },
    isPaid: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Order", orderSchema);
