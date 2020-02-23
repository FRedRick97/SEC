const
    mongoose = require('mongoose'),
    mongoosastic = require('mongoosastic');


var productSchema = mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    name: String,
    price: Number,
    image: String
});


productSchema.plugin(mongoosastic, {
    hosts: [
        'localhost:9200'
    ]
});

module.exports = mongoose.model('Product', productSchema);
