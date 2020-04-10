var express = require('express');
var router = express.Router();

//Get product model
var Page = require('../models/product');

/**
 * GET /
 */
router.get('/', function (req, res) {
    Page.findOne({ slug: 'home' }, function (err, page) {
        if (err)
            return console.log(err);

        res.render('index',
            {
                title: page.title,
                content: page.content
            }
        );
    });
});

// Exports
module.exports = router;