const Product = require("../models/product");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const fileHelper = require("../util/file");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    errorMessage: "",
    oldInput: {
      title: "",
      imageUrl: "",
      description: "",
      price: "",
    },
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, description, price } = req.body;
  const image = req.file;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: "Attached file is not an image",
      oldInput: {
        title: title,
        //imageUrl: imageUrl,
        description: description,
        price: price,
      },
      validationErrors: [],
    });
  }

  const errors = validationResult(req);
  const imageUrl = image.path;

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        title: title,
        //imageUrl: imageUrl,
        description: description,
        price: price,
      },
      validationErrors: errors.array(),
    });
  }

  const newProduct = new Product({
    //_id: mongoose.Types.ObjectId("62f7f6da631374653a7eb501"),
    title: title,
    imageUrl: imageUrl,
    description: description,
    price: price,
    userId: req.user,
  });
  newProduct
    .save()
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      // return res.status(500).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   errorMessage: "Database operation failed, please try again.",
      //   oldInput: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     description: description,
      //     price: price,
      //   },
      //   validationErrors: [],
      // });
      //res.redirect("/500");
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  console.log("in edit");
  const editMode = req.query.edit;
  console.log(editMode);
  if (!editMode) {
    return res.redirect("/");
  }

  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      //throw new Error("Dummy");
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        errorMessage: null,
        validationErrors: [],
        //isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  //const updatedImageUrl = req.body.imageUrl;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      errorMessage: errors.array()[0].msg,
      product: {
        _id: prodId,
        title: updatedTitle,
        //imageUrl: updatedImageUrl,
        description: updatedDesc,
        price: updatedPrice,
      },
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }

      product.description = updatedDesc;
      return product.save().then((result) => {
        console.log("updated product");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  //   Product.findByPk(prodId)
  //     .then((product) => {
  //       (product.title = updatedTitle),
  //         (product.price = updatedPrice),
  //         (product.imageUrl = updatedImageUrl),
  //         (product.description = updatedDesc);
  //       return product.save();
  //     })
  //     .then((result) => {
  //       console.log("updated product");
  //       res.redirect("/admin/products");
  //     })
  //     .catch((e) => {
  //       console.log(error);
  //     });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        //isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found"));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then((result) => {
      res.status(200).json({ message: "Success!" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Deleting product failed" });
    });
};
