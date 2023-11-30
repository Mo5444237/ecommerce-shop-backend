const express = require("express");
const router = express.Router();

const isAuth = require("../middlewares/is-auth");
const isAdmin = require("../middlewares/is-admin");

const {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/admin");

const {
  productValidation,
  categoryValidation,
  subCategoryValidation,
} = require("../validation/admin");

const {
  uploadSingleImage,
  uploadMultibleImages,
} = require("../middlewares/upload-images");

// check if user is authenticated and admin
router.use(isAuth, isAdmin);

// product routes
router.post(
  "/product",
  uploadMultibleImages("images"),
  productValidation,
  createProduct
);

router.put(
  "/product/:productId",
  uploadMultibleImages("images"),
  productValidation,
  updateProduct
);
router.delete("/product/:productId", deleteProduct);

// category routes
router.post(
  "/category",
  uploadSingleImage("image"),
  categoryValidation,
  createCategory
);

router.put(
  "/category/:categoryId",
  uploadSingleImage("image"),
  categoryValidation,
  updateCategory
);

router.delete("/category/:categoryId", deleteCategory);

// subCategory routes
router.post(
  "/subcategory",
  subCategoryValidation,
  createSubCategory
);

router.put(
  "/subcategory/:subCategoryId",
  subCategoryValidation,
  updateSubCategory
);

router.delete(
  "/subcategory/:subCategoryId",
  deleteSubCategory
);

module.exports = router;
