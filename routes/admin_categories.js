var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');

//Get Category model
var Category = require('../models/category');

/**
 * GET pages index
 */
router.get('/', function (req, res) {
    Category.find(function (err, categories) {
        if (err)
            return console.log(err);

        res.render('admin/categories', { categories: categories });
    });
});

/**
 * GET add category
 */
router.get('/add-category', function (req, res) {
    var title = '';
    res.render('admin/add_category', {
        title: title
    });

});

/**
 * POST add category
 */
router.post('/add-category', [
    // username must be an email
    check('title').not().isEmpty().withMessage('Title must have a value.')
],
    function (req, res) {

        var title = req.body.title;
        var slug = title.replace(/\s+/g, '-').toLowerCase();

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        //console.log('errors', errors.array());
        if (!errors.isEmpty()) {
            res.render('admin/add_category', {
                errors: errors.array(),
                title: title
            });
        } else {
            Category.findOne({ slug: slug }, function (err, category) {
                if (category) {
                    req.flash('danger', 'Category slug exists, choose another.');
                    res.render('admin/add_category', {
                        title: title,
                        slug: slug
                    });
                } else {
                    var category = new Category({
                        title: title,
                        slug: slug
                    });

                    category.save(function (err) {
                        if (err)
                            return console.log(err);


                        req.flash('success', 'Category added!');
                        res.redirect('/admin/categories');
                    });
                }
            });
        }

    });

/**
 * GET edit category
 */
router.get('/edit-category/:id', function (req, res) {
    Category.findById(req.params.id, function (err, category) {
        if (err)
            return console.log(err);

        //console.log(page);
        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });
});


/**
 * POST edit category
 */
router.post('/edit-category/:id', [
    // username must be an email
    check('title').not().isEmpty().withMessage('Title must have a value.')
],
    function (req, res) {

        var title = req.body.title;
        var slug = title.replace(/\s+/g, '-').toLowerCase();
        var id = req.params.id;
        // console.log(id);
        // process.exit();
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        //console.log('errors', errors.array());
        if (!errors.isEmpty()) {
            res.render('admin/edit_category', {
                errors: errors.array(),
                title: title,
                id: id
            });
        } else {
            Category.findOne({ slug: slug, _id: { '$ne': id } }, function (err, category) {
                if (category) {
                    req.flash('danger', 'Category title exists, choose another.');
                    res.render('admin/add_category', {
                        title: title,
                        id: id
                    });
                } else {
                    Category.findById(id, function (err, category) {
                        // console.log(category);
                        // console.log(title);
                        // process.exit();
                        if (err)
                            return console.log(err);

                        category.title = title;
                        category.slug = slug;

                        category.save(function (err) {
                            if (err)
                                return console.log(err);


                            req.flash('success', 'Category updated!');
                            res.redirect('/admin/categories/edit-category/' + id);
                        });
                    });

                }
            });
        }

    });


/**
 * GET delete category
 */
router.get('/delete-category/:id', function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);

        req.flash('success', 'Category deleted!');
        res.redirect('/admin/categories');
    });
});

// Exports
module.exports = router;