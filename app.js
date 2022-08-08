const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const MONGO_PASS = require("./SECRET");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
// const User = require("./models/user");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

// app.use((req, res, next) => {
//   const id = "62ee6aa461bdc5a80a1531ab";

// const newUser = new User("Colt", "test@test.com", { items: [] }, id);
// newUser.save();

//   User.findById(id)
//     .then((user) => {
//       req.user = new User(user.name, user.email, user.cart, user._id);
//       next();
//     })
//     .catch((err) => console.log(err));
// });

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.notFoundProducts);

mongoose
  .connect(
    `mongodb+srv://raken:${MONGO_PASS}@cluster0.t7o7cnp.mongodb.net/shop?retryWrites=true&w=majority`
  )
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));
