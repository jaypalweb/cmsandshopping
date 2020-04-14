var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
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
 * POST register
 */
router.post('/register', [
    check('name').not().isEmpty().withMessage('Name is required.'),
    check('email').isEmail().withMessage('Email is required'),
    check('username').not().isEmpty().withMessage('Username is required.'),
    check('password').not().isEmpty().withMessage('Password is required.'),
    check('password2').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match!');
        }
        // Indicates the success of this synchronous custom validator
        return true;
    })
], function (req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('register', {
            errors: errors.array(),
            user: null,
            title: 'Register'
        });
    } else {
        User.findOne({ username: username }, function (err, user) {
            if (err)
                console.log(err);

            if (user) {
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('/user/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err)
                            console.log(err);

                        user.password = hash;

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'You are now registered!');
                                res.redirect('/user/login')
                            }
                        });
                    });
                });
            }
        });
    }
});

/**
 * GET login
 */
router.get('/login', function (req, res) {
    //if already login redirect to home
    if (res.locals.user) {
        res.redirect('/');
    } else {
        res.render('login',
            {
                title: 'Login'
            }
        );
    }
});

/**
 * POST login
 */
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

// Exports
module.exports = router;