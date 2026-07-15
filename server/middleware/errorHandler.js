// Express error handling middleware
const errorHandler = (err, req, res, next) => {
  // 1. Log the error stack to server console
  console.error(err.stack);
  
  // 2. Determine response status code (default to 500 if status is OK)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // 3. Send clean JSON error response to client
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

export default errorHandler;
