const express = require('express');
const wxhelper = require('../helpers/wx');
const https = require('./libs/http');
const queryString = require('querystring');
const request = require("request");
const fs = require('fs');
const http = require('http');
const url = require('url');
const path = require('path');
const {crypto, FileUtil} = require('./libs/utils');
const Md5 = new crypto().md5;
const fileUtil = new FileUtil();
// 路由
const weixin = require('./weixin/index');
const qrcode = require('./qrcode/index');
const fonts = require('./fonts/index');


function getImagePath (fontName) {
    return path.join(__dirname, `../public/image/${fontName}`)
}

let router = express.Router();

router.use('/wx', weixin);

router.use('/qrcode', qrcode);

router.use('/fonts', fonts);

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: '4444'});
});


router.get('/getShopQrCode', function (req, res, next) {
    wxhelper.getAccessToken(function (token) {
        let scene = req.query.scene || '';
        let page = req.query.page || '';
        if (!scene || !page) {
            res.json({
                errcode: 1,
                scene: scene,
                page: page,
                errmsg: 'wrong params'
            });
            return;
        }
        console.log(token, 'token');
        token = encodeURIComponent(token);
        let url = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + token;
        let options = JSON.stringify({
            scene: scene,
            page: page,
            width: 660
        });
        console.log(options);
        https.post(url, options, function (r) {
            res.writeHead(200, {
                'Content-Type': 'image/png'
            });
            res.write(r, 'binary');
            res.end();
        }, 'binary');
    });
});

// router.all('/proxy_image', function (req, res, next) {
//     function errFun () {
//         let err = new Error('加载图片失败');
//         err.status = 400;
//         res.json({info: '加载图片失败', status: 400});
//     }
//
//     let reqOrigin = req.headers.origin;
//     let src = req.query.url;
//     if (!src) {
//         errFun();
//         return;
//     }
//     // let writeStream = fs.createWriteStream('image.png');
//     // let readStream = request(src);
//     // readStream.pipe(writeStream);
//     // readStream.on('end', function (res) {
//     //     console.log('文件下载成功');
//     // });
//     // readStream.on('error', function (err) {
//     //     console.log("错误信息:" + err)
//     // })
//     // writeStream.on("finish", function (req) {
//     //     console.log("文件写入成功");
//     //     writeStream.end();
//     // });
//
//     //request('http://www.valu.cn/images/1.gif').pipe(fs.createWriteStream('./public/upload/downImg/logonew.png'));
//
//     http.get(src, function (r) {
//         let imgData = "";
//         r.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
//         r.on("data", function (chunk) {
//             imgData += chunk;
//         });
//         r.on("end", function () {
//             // fs.writeFile(__dirname, imgData, "binary", function (err) {
//             //     if (err) {
//             //         console.log("保存失败", err);
//             //         errFun();
//             //         return;
//             //     }
//             //     console.log("保存成功");
//             //     fs.readFile(__dirname, 'binary', function (err, data) {
//             //         if (err) {
//             //             console.log(err);
//             //             errFun();
//             //         } else {
//             //             //console.log(data);
//             //             res.write(data, 'binary');
//             //             res.end();
//             //         }
//             //     })
//             // });
//             res.writeHead(200, {
//                 'Content-Type': 'image/png'
//             });
//             res.write(imgData, 'binary');
//             res.end();
//         });
//         r.on("error", function (err) {
//             errFun()
//         });
//     }).on('error', function (err) {
//         errFun()
//     });
// });


class Ut {
    /**
     * 下载网络图片
     * @param {object} opts
     */
    static downImg (opts = {}, path = '') {
        return new Promise((resolve, reject) => {
            let type = '';
            request.get(opts).on('response', (response) => {
                type = response.headers['content-type'];
                console.log("img type:", response.headers['content-type'])
            })
                .pipe(fs.createWriteStream(path))
                .on("error", (e) => {
                    console.log("pipe error", e)
                    resolve(false);
                })
                .on("finish", (data) => {
                    console.log("finish");
                    resolve({path, type});
                })
                .on("close", (data) => {
                    console.log("close");
                })
        })
    };
}

router.all('/proxy_image', async function (req, res, next) {
    let reqOrigin = req.headers.origin;
    let src = req.query.url;
    if (!src.trim()) {
        res.status(403).send("抱歉!找不到你要的图片资源");
        return;
    }
    console.log(reqOrigin);
    try {
        // let url = "http://avatar.csdn.net/1/A/1/3_zzwwjjdj1.jpg";
        let opts = {
            url: src,
        };
        let path = fileUtil.getFilePath(src);
        fs.readFile(path, "binary", async function (err, data) {
            if (err) {
                let r1 = await Ut.downImg(opts, path);
                try {
                    if (r1) {
                        fs.readFile(path, "binary", function (err, data) {
                            if (err) {
                                res.status(403).send("抱歉!找不到你要的图片资源");
                            } else {
                                res.writeHead(200, {
                                    'Content-Type': r1.type || 'image/png'
                                });
                                res.write(data, 'binary');
                                res.end();
                            }
                        })
                    } else {
                        res.status(403).send("抱歉!找不到你要的图片资源");
                    }
                } catch (err) {
                    res.status(403).send("抱歉!找不到你要的图片资源");
                }
            } else {
                let suffix = fileUtil.getSuffixName(path);
                res.writeHead(200, {
                    'Content-Type': !!suffix.trim() ? `image/${suffix}` : 'image/png'
                });
                res.write(data, 'binary');
                res.end();
            }
        });
    } catch (e) {
        console.log(e);
        res.json('error')
    }

});

module.exports = router;
