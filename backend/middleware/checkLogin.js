// root/backend/middleware/checkLogin.js
module.exports = function checkLogin(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not logged in or session expired',
      });
    }
    next();
  };
  