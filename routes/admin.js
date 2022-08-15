const express = require("express");
const { body, validationResult } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);

router.get("/products", isAuth, adminController.getProducts);

router.post(
  "/add-product",
  isAuth,
  [
    body("title", "Title should be alfanumeric and min length should be 3")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("imageUrl", "image url should be a valid url").isURL(),
    body("price", "price should be a floating point").isFloat(),
    body("description", "should be min 5 letters long")
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  isAuth,
  [
    body("title", "Title should be alfanumeric and min length should be 3")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("imageUrl", "image url should be a valid url").isURL(),
    body("price", "price should be a floating point").isFloat(),
    body("description", "should be min 5 letters long")
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  adminController.postEditProduct
);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
