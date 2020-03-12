var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');

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

//routes
app.get('/', function (req, res) {
    res.send('Working');
});

//start the server
var port = 3000;
app.listen(port, function () {
    console.log('Server listening on port ' + port);
});