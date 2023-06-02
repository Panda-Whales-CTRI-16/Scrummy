const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SALT_WORK = 10;
const bcrypt = require('bcryptjs');

// define user schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: false },
  boards: { type: Map, of: String, default: new Map() }
}, { minimize: false });

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

