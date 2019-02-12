const express     = require('express'),
path              = require('path'),
bodyParser        = require("body-parser");
cookieParser      = require('cookie-parser');
multer            = require('multer');
// cors              = require('cors');

// Init app
const app = express();

const pois = require('./api/pois'); // Import pois router to app.js
//this gets so messey here... no sense, need to clean up
const map = require('./routes/map'); // Imports the map route to app.js
const upload = require('./routes/imgupload'); // Import the img upload route to app.js
const auth = require('./auth/index');

const authMiddlewear = require('./auth/middlewear');

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// need to understand these better!
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('keyboard_cat'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(__dirname + '/node_modules/leaflet.locatecontrol/dist/'));

app.use('/auth', auth)
app.use('/api/pois', pois);
app.use('/', authMiddlewear.ensureLoggedIn, map);
app.use('/upload', upload);

//catch 404 and forward error to handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500); // if we dont recieve status set it to 500
  res.json({
    message: err.message,
    error: err
  });
});

// Start Server
app.listen(4321, function(){
  console.log('server is running on port 4321')
});
