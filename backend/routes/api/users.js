// backend/routes/api/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { setTokenCookie } = require('../../utils/auth');
const { validateSignup } = require('../../utils/validateSomeRoutes');
const { User } = require('../../db/models');
const router = express.Router();

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
