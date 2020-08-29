/*
 * Application boilerplate.
 *
 * This files loads the various parts of the application and handles things like serving static files and handling
 * errors. If you just want to understand the WebAuthn part of this example, you do not need to read any of this.
 */

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const validateCheckRouter = require('./routes/validate/check');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// noinspection JSCheckFunctionSignatures
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

// noinspection JSCheckFunctionSignatures
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/validate/check/', validateCheckRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
// noinspection JSUnusedLocalSymbols
app.use(function (err, req, res, next) {
    // set locals
    res.locals.message = err.message;
    res.locals.error = err;

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
