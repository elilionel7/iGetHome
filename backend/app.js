// backend/app.js
const routes = require('./routes');
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { ValidationError } = require('sequelize');
// Import the configuration
const { environment } = require('./config');

// Determine if the environment is production
const isProduction = environment === 'production';

// Initialize the Express application
const app = express();

// Apply middlewares
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
// Security middlewares
if (!isProduction) {
  app.use(cors()); // Enable CORS only in development
}
app.use(
  helmet.crossOriginResourcePolicy({
    policy: 'cross-origin',
  })
); // Helmet for security headers

app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && 'Lax',
      httpOnly: true,
    },
  })
); // Set the _csrf token and create req.csrfToken method

// Define routes...
app.use(routes); // Connect all the routes

// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = 'Resource Not Found';
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
});

// Process sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = 'Validation error';
    err.errors = errors;
  }
  next(err);
});

// Error formatter
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);
  res.json({
    title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack,
  });
});

// Export the app
module.exports = app;
