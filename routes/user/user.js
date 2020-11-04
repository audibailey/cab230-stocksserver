const express = require('express');
const router = express.Router();
const register = require("./register")
const login = require("./login")
// save email and salt and hash and cycle to db

router.post('/register', register);

router.post('/login', login);

module.exports = router;
