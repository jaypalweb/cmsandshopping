var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');

/**
 * GET pages index
 */
router.get('/', function (req, res) {
    res.render('admin/pages', { title: 'Admin Title' });
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
        //req.check('title', 'Title must have a value.').notEmpty();
        //req.check('content', 'Content must have a value.').notEmpty();



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
            console.log('success');
        }

    });

// Exports
module.exports = router;