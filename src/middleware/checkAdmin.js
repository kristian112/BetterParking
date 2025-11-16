function checkAdmin(req, res, next) {
  if (req.cookies && req.cookies.admin === "1") {
    return next();
  }

  return res.redirect("/admin/login");
}

module.exports = checkAdmin;