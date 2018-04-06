var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Abhörer', host: '127.0.0.1:3000' });
});

module.exports = router;
