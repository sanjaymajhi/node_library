var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose= require("mongoose");
var bodyParser=require("body-parser");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter= require("./routes/catalog");

var logged_user=require("./logged_user");

var compression=require("compression");
var helmet=require("helmet");

var app = express();
var dev_db_URl='mongodb+srv://sanjay:1Sanjay@@cluster0-1naxh.mongodb.net/test?retryWrites=true&w=majority';
var mongoDB=process.env.MONGODB_URI || dev_db_URl;
mongoose.connect(mongoDB,{useNewUrlParser:true});
var db=mongoose.connection;
db.on("error",console.error.bind(console,"Mongo Database Error:"));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/catalog",catalogRouter);

app.use(compression());
app.use(helmet());
app.use(bodyParser.json());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
