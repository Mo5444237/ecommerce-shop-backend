const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    sizes: [
      {
        type: String,
        required: true,
      },
    ],
    colors: [
      {
        name: { type: String, required: true },
        code: { type: String, required: true },
      },
    ],
    tags: [String],
  },
  { timestamps: true }
);

productSchema.methods.updateProductData = function (updatedData, images) {
  this.name = updatedData.name ?? this.name;
  this.price = updatedData.price ?? this.price;
  this.description = updatedData.description ?? this.description;
  this.category = updatedData.category ?? this.category;
  this.subCategory = updatedData.subCategory ?? this.subCategory;
  this.colors = updatedData.colors ?? this.colors;
  this.sizes = updatedData.sizes ?? this.sizes;
  this.images = images ?? this.images;

  return this.save();
};

module.exports = mongoose.model("Product", productSchema);
