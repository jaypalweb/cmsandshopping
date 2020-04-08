var express = require('express');
var router = express.Router();

//Get page model
var Product = require('../models/product');

/**
 * GET all products
 */
router.get('/', function (req, res) {
    Product.find(function (err, products) {
        if (err)
            return console.log(err);

        res.render('all_products',
            {
                title: 'All products',
                products: products
            }
        );
    });
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