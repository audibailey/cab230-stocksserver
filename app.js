// Import packages for Express
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

// Import routes
const stockRouter = require('./routes/stocks/stocks');
const userRouter = require('./routes/user/user');
const indexRouter = require('./routes/index');

// Define Database connection and express app
const options = require('./knexfile.js');
const knex = require('knex')(options);
var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Configure express
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configure express with knex
app.use((req, res, next) => {
  req.db = knex
  next()
});

// Configure the logger
logger.token('id', function getId(req) {
  return req.connection.remoteAddress;
})
logger.token('req', (req, _) => {
  const headers = {}
  Object.keys(req.headers).map(function (key, value){
    if (key !== "authorization") { // Security precaution
      headers[key] = req.headers[key]
    }
  })
  return JSON.stringify(headers)
})
logger.token('res', (_, res) => {
  const headers = {}
  res.getHeaderNames().map(h => headers[h] = res.getHeader(h))
  return JSON.stringify(headers)
});
var loggerFormat = ':id :date[web] :method ":url" :status :response-time ms\nRequest Headers: :req\nResponse Headers: :res' ;

// Make express use the logger and format it
app.use(logger(loggerFormat, {
  skip: function (req, res) {
    return res.statusCode < 400
  },
  stream: process.stderr
}));
app.use(logger(loggerFormat, {
  skip: function (req, res) {
    return res.statusCode >= 400
  },
  stream: process.stdout
}));

// Express routes
app.use('/', indexRouter);
app.use('/stocks', stockRouter);
app.use('/user', userRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
