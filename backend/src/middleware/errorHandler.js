module.exports = (err, req, res, _next) => {
  console.error(err.stack || err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
