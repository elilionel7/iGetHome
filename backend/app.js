// backend/app.js
const routes = require('./routes');
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
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

// Export the app
module.exports = app;
