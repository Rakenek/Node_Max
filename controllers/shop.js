const fs = require("fs");
const path = require("path");
const { STRIPE_SECRET } = require("../SECRET");
const stripe = require("stripe")(STRIPE_SECRET);

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const { constants } = require("http2");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        totalProducts: totalItems,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        currentPage: page,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        //isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId).then((prod) => {
    res.render("shop/product-detail", {
      product: prod,
      pageTitle: prod.title,
      path: "/products",
      //isAuthenticated: req.session.isLoggedIn,
    });
  });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        totalProducts: totalItems,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        currentPage: page,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        //isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  // User.findById(req.session.user._id)
  //   .populate("cart.items.productId")
  //   .then((user) => {
  //     const products = user.cart.items.map((prod) => {
  //       return {
  //         title: prod.productId.title,
  //         quantity: prod.quantity,
  //         _id: prod.productId._id,
  //       };
  //     });
  //     res.render("shop/cart", {
  //       path: "/cart",
  //       pageTitle: "Your Cart",
  //       products: products,
  //       isAuthenticated: req.session.isLoggedIn,
  //     });
  //   })
  //   .catch((err) => console.log(err));

  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((prod) => {
        return {
          title: prod.productId.title,
          quantity: prod.quantity,
          _id: prod.productId._id,
        };
      });
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  // let productMy;

  // Product.findById(productId)
  //   .then((product) => {
  //     productMy = product;PDFDocument
  //     res.redirect("/cart");
  //   });

  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = async (req, res, next) => {
  const user = await req.user.populate("cart.items.productId");
  const products = user.cart.items.map((prod) => prod);

  const getLineItem = async function (products) {
    const all_items = [];
    try {
      for (prod of products) {
        const product = await stripe.products.create({
          name: prod.productId.title,
        });

        const price = await stripe.prices.create({
          unit_amount: +prod.productId.price * 100,
          currency: "usd",
          product: product.id,
        });

        const quantity = prod.quantity;
        console.log(price.id, quantity);
        all_items.push({
          price: price.id,
          quantity: quantity,
        });
        //console.log(all_items);
      }

      return all_items;
    } catch (err) {
      console.log(err);
    }
  };

  const line_items = await getLineItem(products);
  console.log(line_items);

  const session = await stripe.checkout.sessions.create({
    line_items: line_items,
    mode: "payment",
    success_url: req.protocol + "://" + req.get("host") + "/checkout/success",
    cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
  });

  //console.log(session);
  //console.log(products);
  let totalSum = 0;
  products.forEach((p) => {
    totalSum += p.productId.price * p.quantity;
  });

  //console.log(totalSum);

  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
    products: products,
    totalSum: totalSum,
    sessionId: session.id,
  });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((prod) => {
        return {
          product: { ...prod.productId._doc },
          quantity: prod.quantity,
        };
      });

      const order = new Order({
        products: products,
        user: {
          email: user.email,
          userId: user,
        },
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((prod) => {
        return {
          product: { ...prod.productId._doc },
          quantity: prod.quantity,
        };
      });

      const order = new Order({
        products: products,
        user: {
          email: user.email,
          userId: user,
        },
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        //isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `in line; filename=${invoiceName}`);

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice");

      pdfDoc.text("-----------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            `${prod.product.title} - ${prod.quantity} x $${prod.product.price}`
          );
      });
      pdfDoc.text("---");
      pdfDoc.fontSize(20).text(`Total Price: $ ${totalPrice}`);

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     `in line; filename=${invoiceName}`
      //   );
      //   res.send(data);
      // });

      // const file = fs.createReadStream(invoicePath);
      // res.setHeader("Content-Type", "application/pdf");
      // res.setHeader("Content-Disposition", `in line; filename=${invoiceName}`);
      // file.pipe(res);
    })
    .catch((err) => next(err));
};
