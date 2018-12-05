"use strict";
const os = require('os');
const path = require('path');
const FontsUtil = require('./default');

const fontsUtil = new FontsUtil();
const FONTS = fontsUtil.FontsList;

const {crypto} = require('../libs/utils');

const util = new crypto();

function getFontPath (fontName) {
    return path.join(__dirname, `../../public/fonts/${fontName}`)
}


const wsFont = function (socket) {
    socket.on('disconnect', function () {

    });
    socket.on('getFontsPath', function (data, callback) {
        let req = socket.client.request
        let networkInterfaces = os.networkInterfaces();
        // console.log(networkInterfaces, 'mac地址', socket);
        console.log(util.getIdentifier(req), 'mac地址', req);
        let txt = data.txt;
        if (txt) {
            txt = decodeURIComponent(txt);
        }
        let fontFamily = data.fontFamily || '';
        let x = data.x || 0;
        let y = data.y || 0;
        let fontSize = data.fontSize || 12;
        if (!txt.trim()) {
            callback({
                info: `请求文本不能为空~`,
                status: 0
            });
            return;
        }
        else if (!fontFamily.trim()) {
            callback({
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
            callback({
                info: `无有效字体~`,
                status: 0
            });
            return;
        }
        // Bessel
        let opts = {
            txt,
            x,
            y,
            type: 'svgPath',
            fontSize,
            fontFamily
        }
        fontsUtil.getOpenType(FontPath, opts).finally(({info, status, msg} = {}) => {
            callback({
                info: {
                    ...info,
                    path: '//' + req.headers.host + '/' + info.path
                },
                msg,
                status: status
            })
        }).catch(err => {

        });
    });
};

exports.listen = function (io, path) {
    io.of(path).on('connection', wsFont)
};