const config = require('config');
const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Abhörer', host: `${config.HOST}:${config.PORT}` });
});

module.exports = router;
