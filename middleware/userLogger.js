// Example middleware: logs request method and URL for user routes
const userLogger = (req, res, next) => {
  console.log(`[userMiddleware] ${req.method} ${req.originalUrl}`);
  next();
};

export default userLogger;
