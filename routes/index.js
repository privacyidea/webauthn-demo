/*
 * Index route.
 *
 * This file handles the delivery of the application markup to the client. if you just want to understand the WebAuthn
 * part of the example, you do not need to read any of this.
 */

const express = require('express');
const router = express.Router();

/* GET home page. */
// noinspection JSUnusedLocalSymbols
router.get('/', function (req, res, next) {
    res.render('index', {title: 'webauthn-demo'});
});

module.exports = router;
