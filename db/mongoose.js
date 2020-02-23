const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/SEC', { keepAlive: 120, useNewUrlParser: true, useCreateIndex: true }, (err) => {
    if (err) return console.log(err);
    else return console.log('Connected');
});

module.exports = mongoose;