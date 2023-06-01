const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SALT_WORK = 10;
const bcrypt = require('bcryptjs');

// define user schema
const userSchema = new Schema({
  username: { type: String, unique: true },
  password: { type: String },
  email: { type: String, required: false },
  boards: { type: Map, of: String, default: new Map() },
  githubId: { type: String },
  githubAccessToken: { type: String },
  githubAvatarUrl: { type: String },
}, { minimize: false });

// Set up validation for required fields
userSchema.path('username').validate(function (value) {
  return this.githubUsername || value;
}, 'Either username/password or GitHub info is required.');

userSchema.path('password').validate(function (value) {
  return this.githubUsername || value;
}, 'Either username/password or GitHub info is required.');


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, SALT_WORK);
    return next();
  } catch (err) {
    return next(err);
  }
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.addBoard = function (boardID, boardName) {
  this.boards.set(boardID, boardName);
  return this.save();
}

userSchema.methods.deleteBoard = function (boardID) {
  this.boards.delete(boardID);
  return this.save();
}

module.exports = mongoose.model('User', userSchema);

