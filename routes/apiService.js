const express = require('express');
const config = require('../config/default');
const jsonwebtoken = require('jsonwebtoken');
const jwt = require('express-jwt');
const router = express.Router();

const getUserInfo = require('./about/getUserIngo');
const WXBizDataCrypt = require('./WXBizDataCrypt/index');
const weixin = require('./weixin/index');
/* GET home page. */
router.use('/getUserInfo', jwt({secret: config.token.secret}), getUserInfo);
router.use('/weixin', weixin);

router.get('/about', function (req, res, next) {
    console.log(req);
    res.json({data: {dddd: 22}, code: 200});
});

module.exports = router;