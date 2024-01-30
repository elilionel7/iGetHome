// backend/routes/api/users.js
const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');

const { handleValidationErrors } = require('../../utils/validation');
const { User } = require('../../db/models');

const router = express.Router();
const { Op } = require('sequelize');

const validateSignup = [
  check('firstName', 'First Name is required').notEmpty(),
  check('lastName', 'Last Name is required').notEmpty(),
  check('email', 'Invalid email').isEmail(),
  check('username', 'Username is required').notEmpty(),
  check('username', 'Username cannot be an email').custom(
    (value, { req }) => !value.includes('@')
  ),
  check('password', 'Password must be 6 characters or more').isLength({
    min: 6,
  }),
  handleValidationErrors,
];
// Sign up
router.post('/', validateSignup, async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  const existingEmailUser = await User.findOne({
    where: { email: email },
  });

  if (existingEmailUser) {
    return res.status(500).json({
      message: 'User already exists',
      errors: { email: 'User with that email already exists' },
    });
  }

  // Check for existing username
  const existingUsernameUser = await User.findOne({
    where: { username: username },
  });

  if (existingUsernameUser) {
    return res.status(500).json({
      message: 'User already exists',
      errors: { username: 'User with that username already exists' },
    });
  }

  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({
    firstName,
    lastName,
    email,
    username,
    hashedPassword,
  });

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  await setTokenCookie(res, safeUser);

  return res.json({
    user: safeUser,
  });
});

module.exports = router;
