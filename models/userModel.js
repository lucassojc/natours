const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name.'],
  },
  email: {
    type: String,
    required: [
      true,
      'Please enter your email address.',
    ],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      'Please enter a valid email address.',
    ],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please enter a password.'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [
      true,
      'Please confirm a password.',
    ],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
