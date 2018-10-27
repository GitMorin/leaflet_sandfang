const express = require('express');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const router = express.Router();
const queries = require('../db/queries');
// Route path are prepended with /auth
const authMiddlewear = require('./middlewear');

router.get('/', (req, res) => {
  res.json({
    message: 'auth'
  })
});

router.get('/login', function (req, res) {
  res.render('../views/pages/login');
});

router.get('/signup', function (req, res) {
  res.render('../views/pages/signup');
});

router.get('/logut', function (req, res) {
  res.clearCookie('user_id');
  res.render('../views/pages/login');
})

router.get('/admin', authMiddlewear.ensureLoggedIn, authMiddlewear.allowAccess, function (req, res) {
  res.render('../views/pages/admin');
});

function validUser(user) {
  const validEmail = typeof user.email == 'string' && // is string
                     user.email.trim() != '' // is not empty
  const validPassword = typeof user.password == 'string' &&
                        user.password.trim() != '' &&
                        user.password.trim().length >= 6;
  
  return validEmail && validPassword;
}

router.post('/signup', (req, res, next) => {
  if(validUser(req.body)) {
    queries
      .getOneByEmail(req.body.email)
      .then(user => {
        // if user not found
        console.log('user',user);
        if(!user){
          // this is a unique email
          // hash password
          bcrypt.hash(req.body.password, 8)
            .then((hash) => {
            // insert user into db
            const user = {
              email: req.body.email,
              password: hash,
              regdate: new Date()
            };

            console.log('user', user);
            queries.createUser(user)
            .then(id => {
              res.json({
                id,
                message: 'user valid'
              });
            });
            // redirect
          });
        } else {
          // email in use!
          next(new Error('Email in use'));
        }
      })
  } else {
    next(new Error('Invalid user'));
  }
});

function setUserIdCookie(req, res, id) {
  res.cookie('user_id', id, {
    httpOnly: true,
    //secure: true, // secure when in production
    signed: true
  });
}

router.post('/login', (req, res, next) => {
  if(validUser(req.body)) {
    // check to see if in db
    queries.getOneByEmail(req.body.email)
    .then(user => {
      console.log('user', user)
      if(user) {
        // compare password with hash password
        bcrypt.compare(req.body.password, user.password)
        .then((result) => {
          // if the password match
          if(result) {
            // setting the 'set cookie' header
            setUserIdCookie(req, res, user.id);
            res.json({
              message: 'Logged in!'
            });
          } else {
            next(new Error('Invalid Login'));
          }
        });
      } else {
        next(new Error('Invalid Login'));
      }
    }); 
  } else {
    next(new Error('Invalid Login'));
  }
});

module.exports = router;