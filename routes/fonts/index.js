/**
 * Created by Aaronzm on 2018/9/22.
 */
"use strict";
const fs = require('fs');
const path = require('path');
let express = require('express');
const _ = require('lodash');
const OpenType = require('opentype.js');

const config = require('config-lite')(__dirname, '../config').wx;
const queryString = require('querystring');
let router = express.Router();

const FontsUtil = require('./default');

const fontsUtil = new FontsUtil();
const FONTS = fontsUtil.FontsList;


function getFontPath (fontName) {
    return path.join(__dirname, `../../public/fonts/${fontName}`)
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: '字体库'});
});

function getOpenType (fontPath, res, req) {
    let txt = req.query.txt + '';
    let fontSize = req.query.fontSize || 12;
    let x = req.query.x || 0;
    let y = req.query.y || 0;
    let type = req.query.type;
    if (!txt) {
        res.json({
            info: `至少一个字符~`,
            status: 0
        });
        return;
    }
    OpenType.load(fontPath, function (err, font) {
        if (err) {
            res.json({
                info: `无法加载字体：${err}`,
                status: 0
            });
        } else {
            let path = font.getPath(txt, x, y, fontSize);
            res.json({
                info: {txt: path.toPathData(3)},
                status: 1
            });
            // Use your font here.
        }
    });
}

router.get('/PingFangSCBold', function (req, res, next) {
    let txt = req.query.txt + '';
    let type = req.query.type;
    // Bessel
    if (!txt.trim()) {
        res.json({
            info: `请求文本不能为空~`,
            status: 0
        });
        return;
    }
    let FontPath = getFontPath(`PingFang Bold.ttf`);
    getOpenType(FontPath, res, req);
});

router.get('/getFontsPath', function (req, res, next) {
    let txt = req.query.txt;
    if (txt) {
        txt = decodeURIComponent(txt);
    }
    let fontFamily = req.query.fontFamily || '';
    let x = req.query.x || 0;
    let y = req.query.y || 0;
    let fontSize = req.query.fontSize || 12;
    if (!txt.trim()) {
        res.json({
            info: `请求文本不能为空~`,
            status: 0
        });
        return;
    }
    else if (!fontFamily.trim()) {
        res.json({
            info: `请求字体不能为空~`,
            status: 0
        });
        return;
    }
    let FontPath = '';
    const fIndex = FONTS.findIndex(v => {
        let path = v.path.replace(/\s*/g, "").toLocaleUpperCase();
        return v.name.toLocaleUpperCase() === fontFamily.toLocaleUpperCase() || v.path.toLocaleUpperCase().indexOf(fontFamily.toLocaleUpperCase()) > -1 || path.indexOf(fontFamily.toLocaleUpperCase()) > -1;
    });
    if (fIndex > -1) {
        FontPath = getFontPath(FONTS[fIndex].path)
    }
    if (!FontPath.trim()) {
        res.json({
            info: `无有效字体~`,
            status: 0
        });
        return;
    }
    // Bessel
    fontsUtil.getOpenType(FontPath, {
        txt,
        x,
        y,
        type: 'svgPath',
        fontSize,
        fontFamily
    }).finally(({info, status} = {}) => {
        res.json({
            info,
            status: status
        })
    }).catch(err => {
        console.log(err);
        next(err)
    });
});

module.exports = router;
