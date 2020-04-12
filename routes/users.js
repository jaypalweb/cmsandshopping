var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

//Get user model
var User = require('../models/user');

/**
 * GET register
 */
router.get('/register', function (req, res) {
    res.render('register',
        {
            title: 'Register'
        }
    );
});

/**
 * GET a page
 */
router.get('/:slug', function (req, res) {
    var slug = req.params.slug;
    Page.findOne({ slug: slug }, function (err, page) {
        if (err)
            return console.log(err);

        if (!page) {
            res.redirect('/');
        } else {
            res.render('index',
                {
                    title: page.title,
                    content: page.content
                }
            );
        }
    });

});


// Exports
module.exports = router;