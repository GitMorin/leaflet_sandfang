const express     = require('express'),
path              = require('path'),
bodyParser        = require("body-parser");
multer            = require('multer');

// Init app
const app = express();

const pois = require('./api/pois'); // Import pois router to app.js
//this gets so messey here... no sense, need to clean up
const map = require('./routes/map'); // Imports the map route to app.js
const upload = require('./routes/imgupload'); // Import the img upload route to app.js


// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// need to understand these better!
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// mount the pois api on the route api/pois
app.use('/api/pois', pois); // whenever we hit api/pois use the pois route /api/pois will run get all. /api/pois/last will run get last etc...
app.use('/', map);
app.use('/upload', upload); // on the upload router I want to use the upload


// catch 404 and forward error to handler
// app.use(function(req, res, next) {
//   const err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handler
// app.use(function(err, req, res, next) {
//   res.status(err.status||500);
//   res.json({
//     message: err.message,
//     error: req.app.get('env') === 'development' ? err : {}
//   });
// });

// Start Server
app.listen(4321, function(){
  console.log('server is running on port 4321')
});
