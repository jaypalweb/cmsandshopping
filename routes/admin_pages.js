var express = require('express');
var router = express.Router();

//routes
router.get('/', function (req, res) {
    res.send('admin area here');
});

// Exports
module.exports = router;