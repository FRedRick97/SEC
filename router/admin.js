const router = require('express').Router(),
    bodyparser = require('body-parser'),
    _ = require('lodash');

const Category = require('../models/Category');

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: false }));

router.get('/add-category', function (req, res) {
    if (req.session.userName === 'Admin') {
        res.render('admin/add-category', {
            errors: req.flash('errors'),
            success: req.flash('success')
        });
    } else {
        req.flash('errors', 'Invalid Path');
        res.redirect('/');
    }
});

router.post('/add-category', function (req, res) {
    let name = _.pick(req.body, ['category']);

    if (name["category"] !== "") {
        Category.findOne({
            name: name["category"]
        }, function (err, doc) {
            if (err) return res.redirect('/');

            if (!doc) {
                let cat = new Category({
                    name: name["category"]
                });

                cat.save(function (err, doc) {
                    req.flash('success', 'Category added successfully');
                    return res.redirect('/add-category');
                });
            } else {
                req.flash('errors', 'Category already exists');
                return res.redirect('/add-category');
            }
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
