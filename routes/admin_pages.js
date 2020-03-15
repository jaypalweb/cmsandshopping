var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');

//Get page model
var Page = require('../models/page');

/**
 * GET pages index
 */
router.get('/', function (req, res) {
    Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
        res.render('admin/pages', { pages: pages });
    });
});

/**
 * GET add page
 */
router.get('/add-page', function (req, res) {
    var title = '';
    var slug = '';
    var content = '';
    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });

});

/**
 * POST add page
 */
router.post('/add-page', [
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

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        console.log('errors', errors.array());
        if (!errors.isEmpty()) {
            res.render('admin/add_page', {
                errors: errors.array(),
                title: title,
                slug: slug,
                content: content
            });
        } else {
            Page.findOne({ slug: slug }, function (err, page) {
                if (page) {
                    req.flash('danger', 'Page slug exists, choose another.');
                    res.render('admin/add_page', {
                        title: title,
                        slug: slug,
                        content: content
                    });
                } else {
                    var page = new Page({
                        title: title,
                        slug: slug,
                        content: content,
                        sorting: 100
                    });

                    page.save(function (err) {
                        if (err)
                            return console.log(err);


                        req.flash('success', 'Page added!');
                        res.redirect('/admin/pages');
                    });
                }
            });
        }

    });

// Exports
module.exports = router;