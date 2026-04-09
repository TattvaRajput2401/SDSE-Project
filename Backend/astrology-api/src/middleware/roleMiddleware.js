const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  if (!req.user?.role) {
    return res.status(403).json({ success: false, message: "Role not found" });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Insufficient access" });
  }

  return next();
};

module.exports = roleMiddleware;
