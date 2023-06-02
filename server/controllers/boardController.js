const Board = require('../models/boardModel');
const User = require('../models/userModel');
const Session = require('../models/sessionModel')
const boardController = {};

boardController.createBoard = async (req, res, next) => {

  // pull board name from request body
  const { boardName } = req.body;

  // pull ssid from cookies
  const { ssid } = req.cookies;

  try {
    
    // create new board with board name
    const board = await Board.create({boardName});

    // destructure board id
    const { id } = board;

    // find user that created the board
    const user = await User.findById(ssid);

    // add board id and name to user 
    user.addBoard(id, boardName);
    board.users.push(ssid);
    board.save();
    console.log(board.users);
    // send board info on res locals
    res.locals.board = board;
    console.log(res.locals.board);
    return next();
  } catch (error) {
    console.log(error);
    return next({err: 'error in createBoard'});
  }
};

boardController.deleteBoard = async (req, res, next) => {
  
  // pull board ID from req params
  const { boardID } = req.params;
  // pull ssid from cookies
  const { ssid } = req.cookies;
  try {
    // find user
    const user = await User.findById(ssid);
    // delete board from user document
    user.deleteBoard(boardID);

    // delete board from board document
    await Board.findOneAndDelete({ _id: boardID });
    
    return next();
  } catch (error) {
    console.log(error);
    return next({ err: 'Error deleting board.' });
  }
};

// boardController.getBoardNames = async (req, res, next) => {
//   const { userID } = req.params;
//   try {
//     const user = await User.findById(userID);
//     const { boards } = user;
//     res.locals.boards = boards;
//     return next();
//   } catch (error) {
//     console.log(error);
//     return next({ err: 'Error finding user data' });
//   }
// };

boardController.getBoardData = async (req, res, next) => {
  console.log('NOW IN GET BOARD DATA')
  const { boardID } = req.query;
  try {
    const board = await Board.findById(boardID) ?? {};
    const { storage, users } = board;
    // add users later
    if(!storage && !users){
      return res.redirect(req.baseUrl + "signup")
    }
    res.locals.board = storage;
    res.locals.users = users;
    console.log('BOARD.STORAGE:', storage);
    console.log('BOARD.USERS:', users);
    return next();
  } catch (error) {
    console.log(error);
    return next({ err: 'Error getting board data' });
  }
};

boardController.updateBoard = async (req, res, next) => {
  console.log('We are in UPDATEBOARD');
  const { boardID } = req.query;
  console.log(boardID)
  const { storage } = req.body;
  try {
    const board = await Board.findByIdAndUpdate(boardID, { storage });
    board.save();
    return next();
  } catch (error) {
    console.log(error);
    return next({ err: 'Error updating board data.' });
  }
};

boardController.updateBoardUsers = async (req, res, next) => {
  console.log('We are in UPDATE BOARD USERS');
  const { boardID } = req.query;
  const { username } = req.body;
  try {
    const board = await Board.findById(boardID);
    const user = await User.findOne({username: username});
    board.users.push(user.id);
    board.save();
    console.log(board.users);
    user.addBoard(boardID, board.boardName);
    console.log(user.boards);
    return next();
  } catch (error) {
    console.log(error);
    return next({ err: 'Error updating board data.' });
  }
}
module.exports = boardController;
