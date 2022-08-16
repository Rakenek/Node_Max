exports.notFoundProducts = (req, res, next) => {
  res.status(404).render("not-found", {
    pageTitle: "page not found",
    path: "",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
};
