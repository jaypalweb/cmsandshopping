var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var { check, validationResult } = require('express-validator');

//Connect to DB
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

//Init app
var app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//set the public folder
app.use(express.static(path.join(__dirname, 'public')));


//Body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Express session middleware
app.use(session({
    secret: 'secret@123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

//Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Set routes
var pages = require('./routes/pages');
var adminPages = require('./routes/admin_pages');

app.use('/admin/pages', adminPages);
app.use('/', pages);

//start the server
var port = 3000;
app.listen(port, function () {
    console.log('Server listening on port ' + port);
});