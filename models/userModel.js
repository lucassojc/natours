const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please enter a password.'],
    minlength: 8,
    select: false, // don't show this field to users
  },
  passwordConfirm: {
    type: String,
    required: [
      true,
      'Please confirm a password.',
    ],
    validate: {
      // This only works on CREATE and SAVE!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match.',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  // Only run this function if the password was modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(
    this.password,
    12
  ); // default salt is 10, 12 is more powerful encryption

  // Delete password confirmation field,  we don't need it anymore
  this.passwordConfirm = undefined;
  next();
}); // encrypt password before saving

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(
    candidatePassword,
    userPassword
  );
}; // instance of all documents for comparing passwords

userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp
) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // password changed
    return JWTTimestamp < changedTimestamp;
  }

  // false means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
