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


/*
 * POST reorder pages
 */
router.post('/reorder-pages', function (req, res) {
    var ids = req.body['id[]'];
    var count = 0;
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        //the function closure is need as Db functions are async, so if not user
        //count value will be last value for all
        (function (count) {

            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err)
                        return console.log(err);
                })
            });
        })(count);
    }

});

/**
 * GET edit page
 */
router.get('/edit-page/:slug', function (req, res) {
    Page.findOne({ slug: req.params.slug }, function (err, page) {
        if (err)
            return console.log(err);

        //console.log(page);
        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
});


/**
 * POST edit page
 */
router.post('/edit-page/:slug', [
    // username must be an email
    check('title').not().isEmpty().withMessage('Title must have a value.'),
    // password must be at least 5 chars long
    check('content').not().isEmpty().withMessage('Content must have a value.')
],
    function (req, res) {

        var title = req.body.title;
        var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
        if (slug == "")
            slug = title.replace(/\s+/g, '-').toLowerCase();
        var content = req.body.content;
        var id = req.body.id;

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        //console.log('errors', errors.array());
        if (!errors.isEmpty()) {
            res.render('admin/edit_page', {
                errors: errors.array(),
                title: title,
                slug: slug,
                content: content,
                id: id
            });
        } else {
            Page.findOne({ slug: slug, _id: { '$ne': id } }, function (err, page) {
                if (page) {
                    req.flash('danger', 'Page slug exists, choose another.');
                    res.render('admin/add_page', {
                        title: title,
                        slug: slug,
                        content: content,
                        id: id
                    });
                } else {
                    Page.findById(id, function (err, page) {
                        if (err)
                            return console.log(err);

                        page.title = title;
                        page.slug = slug;
                        page.content = content;

                        page.save(function (err) {
                            if (err)
                                return console.log(err);


                            req.flash('success', 'Page updated!');
                            res.redirect('/admin/pages/edit-page/' + page.slug);
                        });
                    });

                }
            });
        }

    });


/**
 * GET delete page
 */
router.get('/delete-page/:id', function (req, res) {
    Page.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);

        req.flash('success', 'Page deleted!');
        res.redirect('/admin/pages');
    });
});

// Exports
module.exports = router;