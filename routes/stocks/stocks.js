const express = require('express');
const symbols = require('./symbols');
const stock = require('./stock');
const authstock = require('./authstock');
const authenticate = require("./../user/authenticate")

//  Routes for all /stocks
const router = express.Router();

router.get('/symbols', symbols);

router.get('/:stock', stock);

router.get('/authed/:stock', authenticate, authstock);

module.exports = router;