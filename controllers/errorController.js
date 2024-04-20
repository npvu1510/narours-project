const dotenv = require('dotenv');
const AppError = require('../utils/AppError');

dotenv.config({ path: './.env' });

const toOperationalCastError = err => {
  return new AppError(400, `Invalid ${err.path}: ${err.value}`);
};

const toOperationalDuplicateError = err => {
  const value = err.message.match(/"([^"]*)"/)[1];
  return new AppError(
    400,
    `Duplicate value: ${value}. Please use another value`
  );
};

const toOperationalValidError = err => {
  const messages = Object.values(err.errors)
    .map(e => e.message)
    .join('. ');

  return new AppError(400, messages);
};

const sendErrorDev = (err, req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    return res
      .status(err.statusCode)
      .render('error', { title: 'Something went wrong', message: err.message });
  } else {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  const message = err.isOperational ? err.message : 'Internal server error';

  if (!req.originalUrl.startsWith('/api')) {
    return res
      .status(err.statusCode)
      .render('error', { title: 'Something went wrong', message });
  } else {
    return res.status(500).json({ status: 'error', message });
  }
};

module.exports = (err, req, res, next) => {
  console.log(`⚠️⚠️⚠️ ERROR FROM SERVER`, err);

  err.statusCode ||= 500;
  err.status ||= 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let prodErr = { ...err, message: err.message };

    if (err.name === 'CastError') prodErr = toOperationalCastError(prodErr);
    else if (err.name === 'MongoServerError')
      prodErr = toOperationalDuplicateError(prodErr);
    else if (err.name === 'ValidationError')
      prodErr = toOperationalValidError(prodErr);

    sendErrorProd(prodErr, req, res);
  }
};
