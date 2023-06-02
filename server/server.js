const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');

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
app.use(bodyParser());

// import PORT from .env file
const PORT = process.env.PORT || 8080;

// Serve static files in the /dist folder
app.use('/', express.static(path.join(__dirname, '../dist')));

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
  (_req, res) => {
    return res.status(200).json(res.locals.user); // home page or profile page?
    // possibly route through frontend so just send status and user info
  }
);

app.post(
  '/auth/login',
  userController.verifyUser,
  cookieController.setSSIDCookie,
  sessionController.startSession,
  (_req, res) => {
    // res.locals.user = user data,
    // res.locals.userID = user._id
    // res.locals.session = session
    return res.status(200).json(res.locals.user); // maybe redirect to user profile page
    // send user associated data from DB
  }
);

//SET UP ROUTE FOR LOGOUT
app.delete('/auth/logout', 
  sessionController.endSession, 
  (_req, res) => {
    res.status(200).send('Successful logout.');
  }
);

//*****************BOARD ROUTES*****************/

// CREATE BOARD
app.post('/board/create',
  boardController.createBoard,
  (_req, res) => {
    res.status(200).json(res.locals.board);
  }
);

// // GET BOARD NAMES
// app.get('/board/:userID',
//   boardController.getBoardNames,
//   (req, res) => {
//     res.status(200).json(res.locals.boardArray);
//   }
// );

// GET BOARD DATA, BOARD ID WILL BE PULL FROM REQ QUERY
app.get('/board',
  boardController.getBoardData,
  (_req, res) => {
    res.status(200).json(res.locals.board);
  }
);

// UPDATE BOARD
app.put('/board', 
  boardController.updateBoard, 
  (_req, res) => {
    res.sendStatus(200);
  }
);

// DELETE BOARD
app.delete('/board/:boardID', 
  boardController.deleteBoard, 
  (_req, res) => {
    res.sendStatus(200);
  }
);

// UPDATE BOARD USERS
app.put('/board/users',
  boardController.updateBoardUsers, 
  (_req, res) => {
    res.sendStatus(200);
  }
);

//redirect to enable client-side routing
app.get('*', 
  (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  }
);

// SET UP UNKNOWN ROUTES

app.use('*', 
  (_req, res) => {
    res.status(404).send('Not Found');
  }
);

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
