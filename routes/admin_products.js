var express = require('express');
var path = require('path');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

//Get product model
var Product = require('../models/product');

//Get category model
var Category = require('../models/category');

/**
 * GET pages index
 */
router.get('/', isAdmin, function (req, res) {
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
router.get('/add-product', isAdmin, function (req, res) {
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
    check('title').not().isEmpty().withMessage('Title must have a value.'),
    check('desc').not().isEmpty().withMessage('Description must have a value.'),
    check('price').isDecimal().withMessage('Price must have a value.')
],
    function (req, res) {

        //console.log(req.files.image);
        // process.exit();

        var title = req.body.title;
        var slug = title.replace(/\s+/g, '-').toLowerCase();
        var desc = req.body.desc;
        var price = req.body.price;
        var category = req.body.category;
        //console.log('category', category);
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
router.get('/edit-product/:id', isAdmin, function (req, res) {
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
 * POST edit product
 */
router.post('/edit-product/:id', [
    check('title').not().isEmpty().withMessage('Title must have a value.'),
    check('desc').not().isEmpty().withMessage('Description must have a value.'),
    check('price').isDecimal().withMessage('Price must have a value.')
],
    function (req, res) {
        //console.log(req.files.image);
        // process.exit();

        var title = req.body.title;
        var slug = title.replace(/\s+/g, '-').toLowerCase();
        var desc = req.body.desc;
        var price = req.body.price;
        var category = req.body.category;
        var pimage = req.body.pimage;
        var id = req.params.id;
        //console.log('category', category);
        //console.log('category', category);
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
            req.session.errors = errors.array();
            res.redirect('/admin/products/edit-product/' + id);
        } else {
            Product.findOne({ slug: slug, _id: { '$ne': id } }, function (err, product) {
                if (err)
                    console.log(err);

                if (product) {
                    req.flash('danger', 'Product title exists, choose another.');
                    res.redirect('/admin/products/edit-product/' + id);
                }
                else {
                    Product.findById(req.params.id, function (err, p) {
                        if (err)
                            console.log(err);

                        p.title = title;
                        p.slug = slug;
                        p.desc = desc;
                        p.category = category;
                        p.price = parseFloat(price).toFixed(2);
                        if (imageFile != "") {
                            p.image = imageFile;
                        }
                        p.save(function (err) {
                            if (err)
                                console.log(err);
                            if (imageFile != "") {
                                if (pimage != "") {
                                    // if (fs.existsSync('public/product_images/' + id + '/' + pimage)) {
                                    //     console.log('file exists');
                                    // }
                                    fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                        if (err)
                                            console.log(err);

                                    });
                                }

                                var productImage = req.files.image;
                                var path = 'public/product_images/' + id + '/' + imageFile;

                                productImage.mv(path, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }
                            req.flash('success', 'Product updated!');
                            res.redirect('/admin/products/edit-product/' + id);
                        });
                    });
                }
            });
        }


    });


/**
 * POST product gallery
 */
router.post('/product-gallery/:id', function (req, res) {
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function (err) {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(function (buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });
    res.sendStatus(200);
});

/**
 * GET delete image
 */
router.get('/delete-image/:image', isAdmin, function (req, res) {
    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;
    fs.remove(originalImage, function (err) {
        if (err) {
            return console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    return console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});

/**
 * GET delete product
 */
router.get('/delete-product/:id', isAdmin, function (req, res) {
    var id = req.params.id;
    var path = 'public/product_images/' + id;
    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                if (err)
                    console.log(err);
            });
            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        }
    })
});

// Exports
module.exports = router;