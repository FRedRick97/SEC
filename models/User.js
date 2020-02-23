const mongoose = require('mongoose'),
    validator = require('validator'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcryptjs'),
    util = require('util'),
    MD5 = require('md5.js');


var userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
    address: {
        type: String,
        required: true,
        minlength: 3
    },
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    phone: {
        type: Number,
        required: false,
        minlength: 5
    },
    profilePic: {
        type: String,
        default: ''
    }
});

userSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                user.password = hash;
                next();
            });
        });
    }
    else {
        next();
    }
});

userSchema.statics.findByCredentials = function (email, password, callback) {
    let User = this;
    User.findOne({ email }, function (err, doc) {
        if (err) callback(err);
        if (!doc) return callback(true);
        bcrypt.compare(password, doc.password, function (err, res) {

            if (res) callback(false, doc);
            else callback(true);
        });
    });
};

userSchema.methods.generateAuthToken = function (callback) {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, 'xyz123').toString();

    user.tokens.push({ access, token });
    user.save(function () {
        callback(token);
    });
};

// userSchema.methods.logOut = function (token) {
// var user = this;
// console.log("User=  " + this);
// console.log("TOKEN = " + this.tokens[0].token);

// };

userSchema.methods.gravatar = function (size) {
    if (!this.size) size = 200;
    if (!this.email) return 'http://gravatar.com/avatar/?s' + size;
    var md5 = new MD5().update(this.email).digest('hex');
    const url = 'https://www.gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
    console.log(url);
    return url;
};

var User = mongoose.model('User', userSchema);

module.exports = User;
