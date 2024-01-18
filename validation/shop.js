const { body } = require("express-validator");
const Product = require("../models/product");

exports.addToCartValidation = [
  body("productId", "Invalid data entered").custom(async (val, { req }) => {
    const product = await Product.findById(val);
    const colors = product.colors.map((color) => color.name);

    if (!product) {
      return Promise.reject("Invalid data entered");
    } else if (!colors.includes(req.body.color.name)) {
      return Promise.reject("Enter a valid color");
    } else if (!product.sizes.includes(req.body.size)) {
      return Promise.reject("Enter a valid size");
    }
    return product;
  }),
  body("color", "Please choose a color").exists(),
  body("size", "Please choose a size").exists(),
];
