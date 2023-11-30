const { body } = require('express-validator');
const Category = require('../models/category');

exports.productValidation = [
    body('name', 'Enter a valid name')
        .trim()
        .isLength({ min: 3 })
    ,
    body('description', 'Enter a description with minimum lenght of 8 characters')
        .trim()
        .isLength({ min: 8 })
    ,
    body('price', "Enter a valid price")
        .isNumeric()
    ,
    body('sizes', 'Enter a valid size')
        .custom((value, { req }) => {
            return !(value in ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']);
        })
    ,
    body('colors', 'Enter available colors')
        .notEmpty()
        .withMessage('Enter a valid color')
    ,
    body('category', 'Enter the product category')
        .notEmpty()
    ,
    body('subCategory', 'Enter the product subCategory')
        .notEmpty()
];

exports.categoryValidation = [
    body('name', 'Category name should be at least 3 characters')
        .trim()
        .isLength({ min: 3 })
    ,
    body('slug', 'Category slug should be at least 3 characters')
        .trim()
        .isLength({ min: 3 })
];

exports.subCategoryValidation = [
    body("name", "subcategory name should be at least 3 characters")
        .trim()
        .isLength({ min: 3 }),
    body("slug", "subcategory slug should be at least 3 characters")
        .trim()
        .isLength({ min: 3 }),
    body("category", "Invalid category")
        .custom(async (value, { req }) => {
            const category = await Category.findById(value);
            if (!category) {
                return Promise.reject('no such category');
            }
            return category;
        })
];