const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, description, price } = req.body;
  const newProduct = new Product(title, price, description, imageUrl);
  newProduct
    .save()
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

// exports.getEditProduct = (req, res, next) => {
//   console.log("in edit");
//   const editMode = req.query.edit;
//   console.log(editMode);
//   if (!editMode) {
//     return res.redirect("/");
//   }

//   const prodId = req.params.productId;
//   console.log(prodId);
//   //Product.findByPk(prodId)
//   req.user
//     .getProducts({ where: { id: prodId } })
//     .then((product) => {
//       console.log(product);
//       if (!product) {
//         return res.redirect("/");
//       }
//       res.render("admin/edit-product", {
//         pageTitle: "Edit Product",
//         path: "/admin/edit-product",
//         editing: editMode,
//         product: product[0],
//         //product:product,
//       });
//     })
//     .catch((e) => console.log(e));
// };

// exports.postEditProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   const updatedTitle = req.body.title;
//   const updatedPrice = req.body.price;
//   const updatedImageUrl = req.body.imageUrl;
//   const updatedDesc = req.body.description;

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
// };

// exports.getProducts = (req, res, next) => {
//   //Product.findAll()
//   req.user
//     .getProducts()
//     .then((products) => {
//       res.render("admin/products", {
//         prods: products,
//         pageTitle: "Admin Products",
//         path: "/admin/products",
//       });
//     })
//     .catch((e) => console.log(e));
// };

// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;

//   Product.findByPk(prodId)
//     .then((product) => {
//       return product.destroy();
//     })
//     .then((result) => {
//       console.log("product deleted");
//       res.redirect("/admin/products");
//     })
//     .catch((err) => console.log(err));
// };
