"use strict";
const path = require('path');
const _ = require('lodash');
const OpenType = require('opentype.js');
const fs = require('fs');

const config = require('config-lite')(__dirname, '../config').wx;
const queryString = require('querystring');

const {FontminUtil} = require('../libs/utils')

const fontminUtil = new FontminUtil();

class Fonts {
    constructor () {
        this.FontsList = [
            {
                path: 'PingFang Regular.ttf',
                name: '苹果平方 Regular',
            },
            {
                path: 'PingFang Bold.ttf',
                name: '苹果平方 Bold',
            },
            {
                path: 'NotoSansCJKsc-Black.otf',
                name: 'Noto Sans CJK SC Black',
            },
            {
                path: 'NotoSansCJKsc-Bold.otf',
                name: 'Noto Sans CJK SC Bold',
            },
            {
                path: '腾祥麦黑简.TTF',
                name: '腾祥麦黑简',
            },
            {
                path: '方正字迹-新手书.TTF',
                name: '方正字迹-新手书',
            },
            {
                path: 'HYWenHei-85W.ttf',
                name: '汉仪文黑-85W',
            },
            {
                path: 'HYWenHei-45W.ttf',
                name: '汉仪文黑-45W',
            },
            {
                path: 'HYQiHei-40S.ttf',
                name: '汉仪旗黑-40S',
            },
            {
                path: 'HYQiHei-50S.ttf',
                name: '汉仪旗黑-50S',
            },
            {
                path: 'HYQiHei-80S.ttf',
                name: '汉仪旗黑-80S',
            },
        ];
    }

    getFontPath (fontName) {
        return path.join(__dirname, `../../public/fonts/${fontName}`)
    }

    getOpenType (fontPath, {txt, x, y, fontSize, fontFamily, type = 'svgPath'}) {
        return new Promise((resolve, reject) => {
            if (!txt) {
                reject({info: `至少一个字符~`, status: 0});
            }
            if (type === 'svgPath') {
                OpenType.load(fontPath, async (err, font) => {
                    if (err) {
                        reject({
                            info: `无法加载字体：${err}`,
                            status: 0
                        });
                    } else {
                        let fontPaths = [];
                        let fonts = [];
                        let RowWidths = [];
                        txt = txt.toString();
                        console.log(txt);
                        let txts = txt.split(/\r?\n|\n/g);
                        let i = 0;
                        for (let v of txts) {
                            if (!v) continue;
                            let txt = v.split('');
                            fonts.push(txt);
                            fontPaths[i] = [];
                            let paths = font.getPaths(v, x, y, fontSize);
                            RowWidths.push(font.getAdvanceWidth(v, fontSize));
                            // console.log('字体路劲边界', font.getAdvanceWidth(v, fontSize));
                            for (let path of paths) {
                                fontPaths[i].push(path.toPathData())
                            }
                            i++;
                        }
                        // let path = font.getPath(txt, x, y, fontSize);
                        fontminUtil.getFonts(txt, fontPath, fontFamily, function (data) {
                            if (data) {
                                resolve({
                                    info: {
                                        // txtSvg: path.toSVG(),
                                        // txt: path.toPathData(),
                                        fontPaths: fontPaths,
                                        fonts: fonts,
                                        RowWidths,
                                        path: data.path,
                                        fontFamily: data.fontFamily
                                    }, status: 1
                                });
                            } else {
                                reject({msg: '没有字体', status: 0})
                            }
                        });
                    }
                });
            } else {
                fontminUtil.getFonts(txt, fontPath, fontFamily, function (data) {
                    if (data) {
                        resolve({info: data, status: 1})
                    } else {
                        reject({msg: '没有字体', status: 0})
                    }
                })
            }
        })
    }

    getFontCss (txt) {

    }
}

module.exports = Fonts;