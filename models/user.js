const mongoose = require('mongoose');
const { Schema } = mongoose;
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'first name is required'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'email is required'],
    validate: [isEmail, 'Please fill a valid email address'],
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'password is required'],
  },
  refreshToken: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next;

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    next(err);
  }
};

module.exports = mongoose.model('User', userSchema);



