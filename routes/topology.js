var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('topology', {title: 'node_htip: HTIP Manager' });
});

module.exports = router;
