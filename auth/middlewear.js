const queries = require('../db/queries');
const express = require('express');
const router = express.Router();


function ensureLoggedIn(req, res, next) {
  if(req.signedCookies.user_id) { // see that user_id is set on the cookie
    next();
  } else {
    res.render('../views/pages/login', {message: 'Du må logge inn først'});
    //res.redirect('login');
    // send message that you must be logged in to see the map page?
    // res.status(401);
    // next(new Error('Un-Authorized'));
  }
}

function isAdmin(req, res, next) {
  queries.getUserById(req.signedCookies.user_id)
  .then(user => {
    if(user.id == req.signedCookies.user_id && user.admin == true) {
      next();
    } else {
      //res.render('../views/pages/map')
      res.render('../views/pages/login', {message: 'Du må logge inn som Admin før at nå admin siden!'});
    }
  })
}


module.exports = {
  ensureLoggedIn,
  isAdmin

};