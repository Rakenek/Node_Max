const express = require("express");
const path = require("path");
const rootDir = require("../util/path");
const { products } = require("./admin");
const adminData = require("./admin");

const router = express.Router();
router.get("/", (req, res, next) => {
  const products = adminData.products;
  console.log(products.length > 0);
  res.render("shop", {
    prods: products,
    pageTitle: "Shop",
    path: "/",
    isShop: true,
    hasProducts: products.length > 0,
  });
});

module.exports = router;
