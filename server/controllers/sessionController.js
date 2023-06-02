const Session = require('../models/sessionModel');

const sessionController = {};

// start session - create and save a new Session into the database.

sessionController.startSession = async (req, res, next) => {
  const { userID } = res.locals;
  try {
    const session = await Session.create({ cookieID: userID });
    res.locals.session = session;
    return next();
  } catch (error) {
    console.log(error);
    return next({ err: 'Error creating session' })
  }
};

// end session - find the appropriate session for this request, then delete the session and send the user to the home page

sessionController.endSession = async (req, res, next) => {
  console.log('WE ARE IN END SESSION');
  // console.log(req);
  const { ssid } = req.cookies;
  console.log(ssid);
  try {
    await Session.findOneAndDelete({ cookieID: ssid });
    res.clearCookie('ssid');
    return next();
  } catch (error) {
    console.log(error);
    return next({ err: 'Error deleting session' })
  }
};

// verify session - find the appropriate session for this request in the database, then verify whether or not the session is still valid.

sessionController.verifySession = async (req, res, next) => {
  if (!req.cookies.ssid) {
    // redirect to signups
    res.status(200).redirect('/signup');
  }

  Session.findOne({cookieID: req.cookies.ssid}, (err) => {
    if (err) return res.redirect('/signup');
  })
  return next();
}

module.exports = sessionController;