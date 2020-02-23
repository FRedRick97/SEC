const router = require('express').Router(),
    Category = require('../models/Category'),
    Product = require('../models/Product'),
    bodyparser = require('body-parser'),
    multer = require('multer'),
    auth = require('../middleware/auth'),
    _ = require('lodash'),
    path = require('path');

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: false }));

//multer

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage
}).single('productImage');

var Catid;

router.get('/add-product', auth, function (req, res, next) {
    if (req.user) {
        res.render('admin/add-product', {
            error: req.flash('error'),
            message: req.flash('message')
        });
    } else {
        res.redirect('/');
    }
});

router.post('/add-product', function (req, res, next) {
    console.log(req.body.product_name);
    var x = req.body.product_name;
    Category.findOne({ name: req.body.product_name }, function (err, cat) {
        let category = cat._doc;
        if (err) next(err);

        if (category == null) {
            req.flash('error', 'No such Category found!');
            return res.redirect('/add-product');
        }
        else {
            Catid = category._id;
            console.log(category._id);
            res.redirect('/add-product/new-product');
        }
    });
});

router.get('/add-product/new-product', auth, function (req, res) {
    res.render('admin/new-product');
});

router.post('/add-product/new-product', upload, function (req, res, next) {
    var body = _.pick(req.body, 'name', 'price', 'productImage');
    var product = new Product();

    product.category = Catid;
    product.name = body.name;
    product.price = body.price;
    product.image = req.file.path;
    var img_url;

    // for (var i = 0; i < products.length; i++) {
    if (product.image.startsWith("http")) {
        img_url = product.image;
    } else {
        img_url = req.protocol + '://' + req.get('host') + product.image.replace('uploads/', '/');
    }

    console.log("image url = " + img_url);
    product.save(function (err) {
        if (err) next(err);

        req.flash('success', 'Product added to the database!!');
        return res.redirect('/add-product');
    });
});


module.exports = router;
