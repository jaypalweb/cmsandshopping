var express = require('express');
var router = express.Router();

//Get page model
var Product = require('../models/product');

//Get category model
var Category = require('../models/category');

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
 * GET products by category
 */
router.get('/:category', function (req, res) {

    var categorySlug = req.params.category;

    Category.findOne({ slug: categorySlug }, function (err, category) {
        Product.find({ category: categorySlug }, function (err, products) {
            if (err)
                return console.log(err);

            res.render('cat_products',
                {
                    title: category.title,
                    products: products
                }
            );
        });
    });

});


// Exports
module.exports = router;