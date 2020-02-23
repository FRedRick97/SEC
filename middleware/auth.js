const jwt = require('jsonwebtoken'),
    User = require('../models/User'),
    util = require('util');

let findUser = function (id, token, callback) {
    User.findOne({ _id: id, 'tokens.token': token }, function (err, userObj) {
        if (err) return callback(err);
        else return callback(null, userObj);
    });
};

const auth = function (req, res, next) {
    try {
        const token = req.session.token;
        // console.log("Token = " + token);
        const decoded = jwt.verify(token, 'xyz123');

        const user = findUser(decoded._id, token, function (err, doc) {
            if (!doc) throw new Error();

            req.user = doc;
            next();
        });
    } catch (e) {
        req.flash('errors', 'You are not authorized');
        next();
    }
};

module.exports = auth;
