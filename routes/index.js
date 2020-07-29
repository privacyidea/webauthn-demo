const express = require('express');
const router = express.Router();

/* GET home page. */
// noinspection JSUnusedLocalSymbols
router.get('/', function(req, res, next) {
  res.render('index', { title: 'webauthn-demo' });
});

module.exports = router;
