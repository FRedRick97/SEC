const router = require('express').Router();
const Product = require('../models/Product');

Product.createMapping({ include_type_name: true }, function (err, mapping) {
    if (err) {
        console.log('Error Occured\n\n');
        console.log(err);
    } else {
        console.log('Mapping Created');
        console.log(mapping);
    }
});

function pagination(req, res, next) {
    var perPage = 9;
    var page = parseInt(req.params.page - 1);

    Product
        .find()
        .skip(perPage * page)
        .limit(perPage)
        .populate('category')
        .exec(function (err, products) {
            if (err) return next(err);
            Product.count().exec(function (err, count) {
                if (err) return next(err);

                var img_url = [products.length];
                for (var i = 0; i < products.length; i++) {
                    if (products[i]._doc.image.startsWith("http")) {
                        img_url[i] = products[i]._doc.image;
                    } else {
                        img_url[i] = req.protocol + '://' + req.get('host') + products[i]._doc.image.replace('uploads/', '/');
                    }
                }
                console.log('PAGES  ==== ' + parseInt((count / perPage) + 1));
                res.render('main/product-main', {
                    products: products,
                    image: img_url,
                    pages: parseInt((count / perPage) + 1)
                });
            });
        });

}

router.get('/page/:page', function (req, res, next) {
    pagination(req, res, next);
});

router.post('/search', function (req, res, next) {
    res.redirect('/search?q=' + req.query.q);
});

router.get('/search', function (req, res, next) {
    console.log("query = " + req.query.q);
    if (!req.query.q) {
        res.redirect('/');
    } else {
        Product.search({
            query_string: {
                query: req.query.q
            }
        }, function (err, results) {
            if (err) return err;

            var length = parseInt(JSON.stringify(results.hits.total));

            var img_url = [];
            var name = [];
            var price = [];
            var id = [];
            for (var i = 0; i < length; i++) {
                img_url[i] = req.protocol + '://' + req.get('host') + '/' + JSON.stringify(results.hits.hits[i]._source.image).slice(1, -1).replace('uploads/', '/');
                id[i] = JSON.stringify(results.hits.hits[i]._id).slice(1, -1);
                // console.log('Image After = ' + img_url);
                name[i] = JSON.stringify(results.hits.hits[i]._source.name).slice(1, -1);
                price[i] = JSON.stringify(results.hits.hits[i]._source.price);
            }

            res.render('main/search-result', {
                query: req.query.q,
                length: length,
                id: id,
                data: JSON.stringify(results.hits.hits),
                image: img_url,
                name: name,
                price: price
            });
        });
    }
});

var stream = Product.synchronize();

var count = 0;

stream.on('data', function () { count++; });

stream.on('close', function () {
    console.log("Indexed " + count + " documents");
});

stream.on('error', function (err) {
    console.log(err);
});

router.get('/', function (req, res) {
    res.render('index', {
        errors: req.flash('errors'),
        success: req.flash('success'),
        userName: req.session.userName
    });
});

router.get('/products/:id', function (req, res, next) {
    // we find product with its category.
    Product
        .find({ category: req.params.id })
        .populate('category')
        .exec(function (err, products) {
            if (err) next(err);
            var img_url = [products.length];
            for (var i = 0; i < products.length; i++) {
                if (products[i]._doc.image.startsWith("http")) {
                    img_url[i] = products[i]._doc.image;
                } else {
                    console.log(products[i]._doc.image);
                    img_url[i] = req.protocol + '://' + req.get('host') + products[i]._doc.image.replace('uploads/', '/');
                }
            }
            res.render('main/category', {
                products: products,
                image: img_url
            });
        });
});

router.get('/product/:id', function (req, res, next) {
    Product.findById({ _id: req.params.id }, function (err, product) {
        if (err) next(err);
        // protocol = http, host = localhost:1337 for offline.
        var img_url;
        if (product.image.startsWith("http")) {
            img_url = product.image;
        } else {
            img_url = req.protocol + '://' + req.get('host') + product.image.replace('uploads/', '/');
        }
        // var img_url = req.protocol + '://' + req.get('host') + product.image.replace('uploads/', '/');

        res.render('main/product', {
            product: product,
            image: img_url
        });
    });
});

module.exports = router;
