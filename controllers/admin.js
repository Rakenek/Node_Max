const Product = require("../models/product");
const { validationResult } = require("express-validator");

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
  const { title, imageUrl, description, price } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        title: title,
        imageUrl: imageUrl,
        description: description,
        price: price,
      },
      validationErrors: errors.array(),
    });
  }

  const newProduct = new Product({
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
    .catch((err) => console.log(err));
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
    .catch((e) => console.log(e));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
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
        imageUrl: updatedImageUrl,
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
      product.imageUrl = updatedImageUrl;
      product.description = updatedDesc;
      return product.save().then((result) => {
        console.log("updated product");
        res.redirect("/admin/products");
      });
    })
    .catch((e) => {
      console.log(e);
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
    .catch((e) => console.log(e));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
