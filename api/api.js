const router = require('express').Router(),
    async = require('async'),
    faker = require('faker'),
    Category = require('../models/Category'),
    Product = require('../models/Product');

router.get('/:name', function (req, res, next) {
    async.waterfall([
        function (callback) {
            Category.findOne({ name: req.params.name }, function (err, category) {
                if (err) next(err);
                callback(null, category);
            });
        },
        function (category, callback) {
            for (let i = 0; i < 30; i++) {
                let product = new Product();
                product.category = category._id;
                product.name = faker.commerce.productName();
                product.price = faker.commerce.price();
                product.image = faker.image.image();

                product.save();
            }
        }
    ]);
    res.json({ message: 'Success' });
});

module.exports = router;
