const express = require('express');
const { check, validationResult } = require('express-validator/check');
const flash = require('express-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const util = require('util');


// db
const mongoose = require('./db/mongoose');
// models
const User = require('./models/User');
const Category = require('./models/Category');

// routes
var userRoute = require('./router/user');
var adminRoute = require('./router/admin');
var productRoute = require('./router/product');
const mainRouter = require('./router/main');

const apiRoute = require('./api/api');

const port = process.env.PORT || 3000;

var app = express();

app.use(express.json());

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "creatornpm"
}));

// app.use('/login', session({
//     name: 'sid',
//     resave: false,
//     saveUninitialized: false,
//     secret: 'akatsuki',
//     cookie: {
//         secure: true,
//         sameSite: true
//     }
// }));

app.use('/api', apiRoute);

app.use(function (req, res, next) {
    if (req.session.token) {
        res.locals.originalUser = req.session.token;
    }

    if (req.session.userName == 'Admin') {
        res.locals.admin = true;
    }
    next();
});

app.use(function (req, res, next) {
    Category.find({}, function (err, categories) {
        if (err) next(err);
        res.locals.categories = categories;
        next();
    });
});

app.use(flash());

// app.use(cookieParser('akatsuki'));

app.set('view engine', 'pug');
app.use(express.static('uploads'));
app.use('/assets', express.static(__dirname + '/public'));

app.use(mainRouter);
app.use(userRoute);
app.use(adminRoute);
app.use(productRoute);

app.listen(port, function () {
    console.log(`Server started at port ${port}`);
});

