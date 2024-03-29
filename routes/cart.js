var express = require('express');
var router = express.Router();

var auth = require('../config/auth');
var isUser = auth.isUser;

//Get product model
var Product = require('../models/product');

/**
 * GET add product to cart
 */
router.get('/add/:product', isUser, function (req, res) {
    var slug = req.params.product;

    Product.findOne({ slug: slug }, function (err, product) {
        if (err)
            return console.log(err);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(product.price).toFixed(2),
                image: '/product_images/' + product._id + '/' + product.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;
            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(product.price).toFixed(2),
                    image: '/product_images/' + product._id + '/' + product.image
                });
            }
        }
        //console.log(req.session.cart);
        req.flash('success', 'Product added!');
        res.redirect('back');
    });
});

/**
 * GET checkout page
 */
router.get('/checkout', function (req, res) {
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }

});

/**
 * GET update product
 */
router.get('/update/:product', isUser, function (req, res) {
    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1)
                        cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');
});

/**
 * GET clear cart page
 */
router.get('/clear', isUser, function (req, res) {
    delete req.session.cart;
    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/checkout');
});

/**
 * GET buy now
 */
router.get('/buynow', isUser, function (req, res) {
    delete req.session.cart;
    res.sendStatus(200);
});

// Exports
module.exports = router;