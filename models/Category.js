const mongoose = require('mongoose');

var categorySchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        lowercase: true
    }
});

module.exports = mongoose.model('Category', categorySchema);
