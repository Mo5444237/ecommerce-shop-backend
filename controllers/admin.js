const { validationResult } = require("express-validator");
const slugify = require("slugify");
const clearImages = require('../utils/clear-images');

const Product = require("../models/product");
const Category = require("../models/category");
const SubCategory = require("../models/subCategory");

// Product routes
exports.createProduct = async (req, res, next) => {
  const productData = { ...req.body };
  const imagesData = req.files;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid input");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    const images = imagesData.map((file) => {
      return file.path.replace("\\", "/");
    });
    const product = new Product({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      images: images,
      sizes: productData.sizes,
      colors: productData.colors,
      category: productData.category,
      subCategory: productData.subCategory,
    });

    await product.save();
    res.status(201).json({ message: "product created successfully" });
  } catch (error) {
    next(error);
  }
};


exports.updateProduct = async (req, res, next) => {
  const productId = req.params.productId;
  const updatedData = { ...req.body };
  const imagesData = req.files;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid input");
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

    // Remove old images and upload new ones
    let images;
    if (imagesData.length > 0) {
      clearImages(product.images);
      images = imagesData.map((file) => {
        return file.path.replace("\\", "/");
      });
    }

    product.updateProductData(updatedData, images);

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    next(error);
  }
};


exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const deleted = await Product.findByIdAndDelete({ _id: productId });
    if (!deleted) {
      const error = new Error("No such product");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    next(error);
  }
};



// Category routes
exports.createCategory = async (req, res, next) => {
  const categoryData = req.body;
  const categoryImage = req.file;
  try {
    const image = categoryImage.path.replace("\\", "/");
    const category = new Category({
      name: categoryData.name,
      slug: slugify(categoryData.slug),
      image: image,
    });
    await category.save();
    res.status(201).json({ message: "category created"});
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  const updatedData = req.body;
  const updatedImage = req.file;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error("No such category");
      error.statusCode = 404;
      throw error;
    }
    category.name = updatedData.name;
    category.slug = slugify(updatedData.slug);
    category.image = updatedImage.path.replace("\\", "/");

    await category.save();
    res.status(200).json({ message: "Category updated"});
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  try {
    const deleted = await Category.findByIdAndDelete(categoryId);
    if (!deleted) {
      const error = new Error("No such category");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Category deleted"});
  } catch (error) {
    next(error);
  }
};


// Sub-category routes
exports.createSubCategory = async (req, res, next) => {
  const subCategoryData = req.body;
  console.log(subCategoryData);
  try {
    const subCategory = new SubCategory({
      name: subCategoryData.name,
      slug: slugify(subCategoryData.slug),
      category: subCategoryData.categoryId,
    });
    await subCategory.save();
    res
      .status(201)
      .json({ message: "subcategory added"});
  } catch (error) {
    next(error);
  }
};

exports.updateSubCategory = async (req, res, next) => {
  const subCategoryId = req.params.subCategoryId;
  const updatedData = req.body;
  try {
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      const error = new Error("no such subcategory");
      error.statusCode = 404;
      throw error;
    }
    subCategory.name = updatedData.name;
    subCategory.slug = slugify(updatedData.slug);
    subCategory.category = updatedData.categoryId;

    await subCategory.save();
    res
      .status(200)
      .json({ message: "subcategory updated"});
  } catch (error) {
    next(error);
  }
};

exports.deleteSubCategory = async (req, res, next) => {
  const subCategoryId = req.params.subCategoryId;
  try {
    const deleted = await SubCategory.findByIdAndDelete(subCategoryId);
    if (!deleted) {
      const error = new Error("no such subcategory");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "subcategory deleted"});
  } catch (error) {
    next(error);
  }
};
