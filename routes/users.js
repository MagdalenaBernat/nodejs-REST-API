const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/user');

const router = express.Router();

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

router.post('/signup', async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const token = jwt.sign({ id: user._id }, 'secret-key', { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// logout
const auth = require('../middleware/auth');

router.get('/logout', auth, async (req, res) => {
  try {
    const user = req.user;
    user.token = null;
    await user.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// pobieranie danych
router.get('/current', auth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;