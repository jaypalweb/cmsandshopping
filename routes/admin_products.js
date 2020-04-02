var express = require('express');
var path = require('path');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

//Get product model
var Product = require('../models/product');

//Get category model
var Category = require('../models/category');

/**
 * GET pages index
 */
router.get('/', function (req, res) {
    var count;
    Product.countDocuments(function (err, c) {
        count = c;
    });

    Product.find(function (err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });

});

/**
 * GET add product
 */
router.get('/add-product', function (req, res) {
    var title = '';
    var desc = '';
    var price = '';
    Category.find(function (err, categories) {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    });
});

/**
 * POST add product
 */
router.post('/add-product', [
    // username must be an email
    check('title').not().isEmpty().withMessage('Title must have a value.'),
    // password must be at least 5 chars long
    check('desc').not().isEmpty().withMessage('Description must have a value.'),
    check('price').isDecimal().withMessage('Price must have a value.')
],
    function (req, res) {

        console.log(req.files.image);
        // process.exit();

        var title = req.body.title;
        var slug = title.replace(/\s+/g, '-').toLowerCase();
        var desc = req.body.desc;
        var price = req.body.price;
        var category = req.body.category;
        console.log('category', category);
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        //console.log('errors', errors);

        //check upload file if image
        //console.log(req.files);
        //process.exit();
        var imageFile = "";

        //var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
        if (req.files != null && typeof req.files.image !== "undefined") {
            imageFile = req.files.image.name;
            var extension = (path.extname(imageFile)).toLowerCase();
            //console.log('extension', extension);
            switch (extension) {
                case '.jpg':
                case '.jpeg':
                case '.png':
                case '':
                    'ok';
                    break;
                default:
                    errors.errors.push({
                        value: '',
                        msg: 'You must upload an Image',
                        param: 'image',
                        location: 'body'
                    });
            }
        }

        if (!errors.isEmpty()) {
            // console.log(errors);
            // process.exit();
            Category.find(function (err, categories) {
                res.render('admin/add_product', {
                    errors: errors.array(),
                    title: title,
                    desc: desc,
                    categories: categories,
                    price: price
                });
            });

        } else {
            Product.findOne({ slug: slug }, function (err, product) {
                if (product) {
                    req.flash('danger', 'Product title exists, choose another.');
                    Category.find(function (err, categories) {
                        res.render('admin/add_product', {
                            title: title,
                            desc: desc,
                            categories: categories,
                            price: price
                        });
                    });
                } else {
                    var priceNum = parseFloat(price).toFixed(2);

                    var product = new Product({
                        title: title,
                        slug: slug,
                        desc: desc,
                        price: priceNum,
                        category: category,
                        image: imageFile
                    });

                    product.save(function (err) {
                        if (err)
                            return console.log(err);

                        // console.log('p-id', product._id);
                        // process.exit();
                        mkdirp('public/product_images/' + product._id).then((made) => {

                            if (imageFile != "") {
                                var productImage = req.files.image;
                                var path = 'public/product_images/' + product._id + '/' + imageFile;

                                productImage.mv(path, function (err) {
                                    return console.log(err);
                                });
                            }
                        });
                        mkdirp('public/product_images/' + product._id + '/gallery').then(function (made) {
                            //return console.log(made);
                        });
                        mkdirp('public/product_images/' + product._id + '/gallery/thumbs').then(function (made) {
                            //return console.log(made);
                        });


                        req.flash('success', 'Product added!');
                        res.redirect('/admin/products');
                    });
                }
            });
        }

    });

/**
 * GET edit product
 */
router.get('/edit-product/:id', function (req, res) {
    var errors;
    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    Category.find(function (err, categories) {
        Product.findById(req.params.id, function (err, product) {
            if (err) {
                console.log(err);
                res.redirect('admin/products');
            } else {
                var galleryDir = 'public/product_images/' + product._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        //console.log(page);
                        res.render('admin/edit_product', {
                            title: product.title,
                            errors: errors,
                            desc: product.desc,
                            categories: categories,
                            category: product.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(product.price).toFixed(2),
                            image: product.image,
                            galleryImages: galleryImages,
                            id: product._id
                        });
                    }
                });
            }
        });
    });
});


/**
 * POST edit page
 */
router.post('/edit-page/:id', [
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
        var id = req.params.id;

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
                            res.redirect('/admin/pages/edit-page/' + id);
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