/**
 * Created by Aaronzm on 2018/9/22.
 */
"use strict";
const fs = require('fs');
const path = require('path');
let express = require('express');
const _ = require('lodash');

const config = require('config-lite')(__dirname, '../config').wx;
const queryString = require('querystring');
let router = express.Router();


/* GET home page. */
router.get(/.txt$/, function (req, res, next) {
    let arr = req.url.split('/');
    let fspath = path.join(__dirname, `../../public/qrcode/${arr[arr.length - 1]}`)
    fs.readFile(fspath, "utf-8", function (err, data) {
        if (err) {
            console.log(err);
            res.send("文件不存在！" + fspath);
        } else {
            res.send(data);
        }
    });
});

const routerUrls = {
    shop_home: {
        path: 'https://app.mmtcapp.com/mmtch5/#/shop_home',
        query: ['shop_id']
    }
};

router.get(/^\//, function (req, res, next) {
    let arr = req.url.split(/[?|#]/)[0].split('/');
    console.log(arr);
    let query = req.query;
    if (routerUrls[arr[arr.length - 1]]) {
        let url = routerUrls[arr[arr.length - 1]];
        if (query.id) {
            for (let i = 0; i < url.query.length; i++) {
                let v = url.query[i]
                if (/id/.test(v)) {
                    query[v] = query.id;
                    delete query.id
                }
            }
        }
        let redirectUrl = `${url.path}?${queryString.stringify(query)}`;
        res.redirect(redirectUrl);
    } else {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.render('index', {title: '失效二维码'});
    }
});


module.exports = router;
