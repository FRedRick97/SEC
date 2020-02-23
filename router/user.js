const router = require('express').Router(),
    bodyparser = require('body-parser'),
    Cart = require('../models/cart'),
    _ = require('lodash'),
    async = require('async'),
    auth = require('../middleware/auth');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const User = require('../models/User');

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: false }));

router.get('/signup', function (req, res) {
    res.render('accounts/signup', {
        errors: req.flash('errors')
    });
});

router.post('/signup', [
    check('fname', 'empty').isLength({ min: 3 }).withMessage('name must be at least 3 characters long').trim(),
    check('email', 'empty').isEmail().normalizeEmail().withMessage('Invalid email address')
], function (req, res, next) {
    async.waterfall([
        function (callback) {
            var pwd = _.pick(req.body, ['password', 'confirm']);
            if (_.isEqual(pwd.password, pwd.confirm)) {
                var body = _.pick(req.body, ['email', 'password', 'address', 'name', 'phone']);

                var user = new User(body);
                user.profilePic = user.gravatar();

                user.save(function (err, doc) {
                    if (err) console.log("Error zzz " + err);
                    user.generateAuthToken(function (token) {
                        // res.header('x-auth', token).redirect('/');
                        // res.cookie('auth', token, { signed: true }).redirect('/');
                        // res.header('x-auth', token).send(user);

                        req.session.token = user.tokens[0].token;
                        req.session.userName = user.name;
                        callback(null, doc);
                    });
                });
            } else {
                req.flash('errors', "Password doesn't match");
                res.redirect('/signup');
            }
        }
    ], function (err, user) {
        if (err) res.redirect('/');
        var cart = new Cart();
        cart.owner = user._id;
        cart.save(function (err) {
            if (err) return next(err);
            res.redirect('/');
        });
    });
});


router.get('/login', function (req, res) {
    if (req.session.token) {
        req.flash('errors', 'Already Logged in');
        return res.redirect('/');
    }
    res.render('accounts/login', {
        errors: req.flash('errors'),
        success: req.flash('success')
    });
});

router.post('/login', function (req, res, next) {
    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password, function (err, user) {
        if (err) {
            req.flash('errors', 'Invalid email or password.');
            res.redirect('/login');
        } else {
            // res.header('user', user.name).redirect('/');
            // res.cookie('auth', user.tokens[0].token, { signed: true }).redirect('/');
            // res.header('user', user.name).send(user);
            user.generateAuthToken(function (token) {
                // res.header('x-auth', token).redirect('/');
                // res.cookie('auth', token, { signed: true }).redirect('/');
                // res.header('x-auth', token).send(user);
                req.flash('success', 'Successfull login!!!!');
                req.session.token = user.tokens[0].token;
                req.session.userName = user.name;
                res.redirect('/');
            });
            // console.log("SESSION TOKEN ===>>>>" + req.session.token);
            // return res.redirect('/');
        }
    });
});

router.get('/logout', auth, function (req, res) {
    User.findByIdAndUpdate(
        { _id: req.user.id },
        {
            $pull: { "tokens": { "token": req.session.token } }
        }, { returnNewDocument: true }, function (err, res) {
            // console.log("RES ===>>>" + res);
        }
    );
    // req.user.logOut(req.session.token);
    req.session.destroy();
    res.redirect('/');
});

router.get('/profile', auth, function (req, res) {
    if (req.user) {
        User.findOne({ _id: req.user._id }, function (err, user) {
            if (err) return err;
            res.render('accounts/profile', { user });
        });
    } else {
        req.flash('errors', 'Unauthorized');
        res.redirect('/');
    }

});

module.exports = router;
