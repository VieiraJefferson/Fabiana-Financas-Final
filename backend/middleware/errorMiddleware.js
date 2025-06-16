const notFound = (req, res, next) => {
  const error = new Error(`Não encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.error('=== ERROR HANDLER DEBUG ===');
  console.error('Error:', err);
  console.error('URL:', req.url);
  console.error('Method:', req.method);
  console.error('User:', req.user?._id);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  
  res.json({
    message: err.message,
    error: process.env.NODE_ENV === 'production' ? undefined : err,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    url: req.url,
    method: req.method
  });
};

module.exports = { notFound, errorHandler }; 