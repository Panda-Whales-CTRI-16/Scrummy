
const User = require('../models/userModel');

const cookieController = {};

// store the user id in a cookie
cookieController.setSSIDCookie = (req, res, next) => {
  res.cookie('ssid', res.locals.userID, {
    maxAge: 86400000,
    httpOnly: true,
  });
  return next();
};

module.exports = cookieController;