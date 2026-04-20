const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  let message = err.message;
  // Mask sensitive backend or JWT errors from the UI
  if (message.includes('secretOrPrivateKey') || message.includes('jwt') || message.includes('ENOENT')) {
    message = 'A server configuration error occurred. Please contact support.';
  }

  res.status(statusCode).json({
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
