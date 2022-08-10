exports.notFoundProducts = (req, res, next) => {
  res
    .status(404)
    .render("not-found", {
      pageTitle: "page not found",
      path: "",
      isAuthenticated: req.isLoggedIn,
    });
};
