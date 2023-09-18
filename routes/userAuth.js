const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { isLoggedIn } = require('../middleware');
const userValidationSchema = require('../validation/userValidation');
const cookieParser = require('cookie-parser');

router.post('/register', async (req, res, next) => {
  try {
    await Users.deleteMany({});
    const { error } = userValidationSchema.validate(req.body);

    if (error) {
      const errorMessage = error.details[0].message;
      return next({ message: errorMessage });
    }
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return next({ message: err.message });
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user)
      return next({ status: 404, message: 'Invalid Username/Password' });

    //Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next({ status: 401, message: 'Invalid Username/Password' });
    }

    //GENERATE ACCESS TOKEN
    const token = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30m' }
    );

    //GENERATE REFRESH TOKEN
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET
    );
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 }); //1hr
    res.status(200).json({ accessToken: token, refreshToken: refreshToken });
  } catch (err) {
    return next({ message: err.message });
  }
});

router.post('/refresh-tokens', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return next({ status: 404, message: 'User not found' });

    //Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30m' }
    );

    res.clearCookie('jwt');
    res.cookie('jwt', newAccessToken, { httpOnly: true, maxAge: 3600000 });
    return res.status(200).json({ newAccessToken: newAccessToken });
  } catch (err) {
    return next({ status: 403, message: err.message });
  }
});

router.post('/logout', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    const cookies = req.cookies;
    if (!user) return next({ status: 404, message: 'User not found' });
    user.refreshToken = null;
    await user.save();
    console.log('Successfully logged out');
    Object.keys(cookies).forEach((cookieName) => {
      res.clearCookie(cookieName);
    });

    res.status(200).json(user);
  } catch (err) {
    return next({ message: err.message });
  }
});

router.get('/dashboard', isLoggedIn, async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  console.log(`WELCOME ${user.username}`);
  res.json(user);
});

module.exports = router;
