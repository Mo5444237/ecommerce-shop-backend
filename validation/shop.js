const { body } = require("express-validator");
const Product = require('../models/product');


exports.addToCartValidation = [
    body("productId", "Invalid data entered")
        .custom(async (val, { req }) => {
            const product = await Product.findById(val);
            if (!product || !product.colors.includes(req.body.color) || !product.sizes.includes(req.body.size)) {
                return Promise.reject('Invalid data entered');
            }
            return product;
        }),
    body('color', "Please choose a color")
        .exists()
    ,
    body('size', "Please choose a size")
        .exists()
    ,
];