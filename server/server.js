const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

//---------IMPORT CONTROLLERS--------//
const userController = require('./controllers/userController.js');
const cookieController = require('./controllers/cookieController.js');
const sessionController = require('./controllers/sessionController.js');
const boardController = require('./controllers/boardController.js');

// import socket io listeners
const handleSocketIO = require('./socketIO.js');

//-----------MONGO DB CONNECTION STRING---------//
// mongo uri stored in .env file, must configure to string
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;
mongoose.set('strictQuery', false);

const app = express();
const server = http.Server(app);
app.use(cookieParser());
app.use(express.json());

// import PORT from .env file
const PORT = process.env.PORT || 8080;

// Serve static files in the /dist folder
app.use('/', express.static(path.join(__dirname, '../dist')));

//redirect to enable client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// configure socket.IO server
const io = socketIO(server, {
  pingTimeout: 1000, // how many ms without a ping packet to consider the connection closed
  pingInterval: 3000, // how many ms before sending a new ping packet
});

// SET UP ROUTES FOR LOGIN AND SIGNUP
app.post(
  '/auth/signup',
  userController.createUser,
  cookieController.setSSIDCookie,
  sessionController.startSession,
  (req, res) => {
    return res.status(200).json(res.locals.user); // home page or profile page?
    // possibly route through frontend so just send status and user info
  }
);

// FRONT END REQUEST:

// const loginUserData = {
//   username: usernameRef.current.value,
//   password: passwordRef.current.value,
// };

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     const postURL = '/auth/login';
//     const fetchResponse = await fetch(postURL, {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(loginUserData),
//     });
//     const data = await fetchResponse.json();
//     setClientData(data);

app.post(
  '/auth/login',
  userController.verifyUser,
  cookieController.setSSIDCookie,
  sessionController.startSession,
  (req, res) => {
    // res.locals.user = user data, 
    // res.locals.userID = user._id
    // res.locals.session = session
    return res.status(200).json(res.locals.user); // maybe redirect to user profile page
    // send user associated data from DB
  }
);

//SET UP ROUTE FOR LOGOUT
// Need to check if this idea works
app.delete('/auth/logout', sessionController.endSession, (req, res) => {
  res.status(200).send('Successful logout.');
});

//*****************BOARD ROUTES*****************/ 

// GET BOARD NAMES
app.get('/board/:userID',
  boardController.getBoardNames,
  (req, res) => {
    res.status(200).json(res.locals.boardArray);
  }
);

// GET BOARD DATA
app.get('/board/:boardID',
  boardController.getBoardData,
  (req, res) => {
    res.status(200).json(res.locals.board);
  }
);
// DELETE BOARD
app.delete('/board/:boardID',
  boardController.deleteBoard,
  (req, res) => {
    res.sendStatus(200);
  }
);

// UPDATE BOARD
app.put('/board/:boardID',
  boardController.updateBoard,
  (req, res) => {
    res.status(200).json(res.locals.board);
  }
);

// CREATE BOARD
app.post('/board/create',
  boardController.createBoard,
  (req, res) => {
    res.status(200).json(res.locals.board);
  }
);

// SET UP UNKNOWN ROUTES

app.use('*', (_req, res) => {
  res.status(404).send('Not Found');
});

// SET UP GLOBAL ERROR HANDLER
app.use((err, _req, res, _next) => {
  console.log(err);
  res.status(500).send({ err });
});

// start app with mongoose connection, server, and socket listeners
const start = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to Database');
    handleSocketIO(io);
    server.listen(PORT, () => {
      console.log('App listening on PORT ' + PORT);
    });
  } catch (error) {
    console.log(error.message);
  }
};
start();
