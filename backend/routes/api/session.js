// backend/routes/api/session.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { validateLogin } = require('../../utils/validateSomeRoutes');


const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// Get the current user
router.get('/', restoreUser,(req, res) => {
  if (req.user) {
    return res.status(200).json({
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        username: req.user.username,
      },
    });
  } else {
    return res.json({ user: null });
  }
});

// Log in
router.post('/', validateLogin, async (req, res, next) => {
  const { credential, password } = req.body;

  try {
    
    const user = await User.unscoped().findOne({
      where: {
        [Op.or]: {
          username: credential,
          email: credential,
        },
      },
    });
  
    if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }
  
    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    }
        await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'An error occurred while trying to log in. Please try again later.',
    });
  }
});
// Log out
router.delete('/', (_req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'success' });
});

module.exports = router;
