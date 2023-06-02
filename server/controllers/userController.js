const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const userController = {};

// CREATE-USER: Obtain username and password from the request body, create a new User and save username and password into the database with User schema

userController.createUser = async (req, res, next) => {
  
  // destructure req body
  const { body } = req;
    
    // create a new user 
    try {
      // check if username already exists in DB
      const usernameExists = await User.findOne({username: body.username});
      if (usernameExists) {
        res.status(400).send('An account with this username already exists.')
      }
      // make sure username/password are not empty strings
      if (!body.username || !body.password) {
        return next({err: 'Invalid username/password input.'});
      }

      // create a new user
      const user = await User.create(body);

      // store user info on locals
      res.locals.userID = user._id.toString();
      res.locals.user = user;

      // move to next middleware
      return next();
    } catch (error) {
      console.log(error);
      return next({ err: 'Error creating new user' })
    }
};

// VERIFY-USER: Obtain username and password from the request body, locate the appropriate user in the database, authenticate the submitted password against the password stored in the database.

userController.verifyUser = async (req, res, next) => {
    console.log('Now in verifyUser');
    const { username, password } = req.body;
    if ( !username || !password ) {
      return next('Username and password are required.');
    }

    try {
      const user = await User.findOne({ username });

      const pwMatch = await bcrypt.compare(password, user.password);

      if (user && pwMatch) {
        res.locals.userID = user._id.toString();
        res.locals.user = user;

        res.locals.boards = JSON.stringify(Array.from(user.boards));
        console.log(res.locals.boards);
        return next();
      } else return next({ err: 'Invalid credentials.' });
    } catch (error) {
      console.log(error);
      return next({ err: 'Could not find user' })
    }
};

module.exports = userController;