var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

var index = require('./routes/index');
var favorites = require('./routes/favorites');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var mongo_url = process.env.MONGO_URL;

//configure session store. Remember to configure DB url for this app's database
var store = new MongoDBStore({ uri: mongo_url, collection: 'sessions'}, function (err) {
    if (err){
      console.log("Error, can't connect to MongoDB to store sessions");
    }
});

//configure sessions
app.use(session({
    secret: 'top secret!',
    resave: true,
    saveUninitialized: true,
    store: store
}));

app.use('/', index);
app.use('/favorites', favorites);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
