// Example middleware: logs request method and URL for user routes
module.exports = function userLogger(req, res, next) {
  console.log(`[userMiddleware] ${req.method} ${req.originalUrl}`);
  next();
};
