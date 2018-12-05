let WXBizDataCrypt = require('./WXBizDataCrypt');
const config = require('config-lite')(__dirname, '../config').wx_client;
let express = require('express');
const https = require('https');

let router = express.Router();


router.post('/', function (req, res, next) {
    let encryptedData = req.body.encryptedData;
    let iv = req.body.iv;
    let js_code = req.body.js_code;
    https.get('https://api.weixin.qq.com/sns/jscode2session?appid=' + config.appId + '&secret=' + config.secret +
        '&js_code=' + js_code + '&grant_type=authorization_code', (data) => {
            console.log('状态码：', data.statusCode);
            console.log('请求头：', data.headers);
            data.on('data', (d) => {
                let _data = JSON.parse(d);
                const sessionKey = _data.session_key;
                // var pc = new WXBizDataCrypt(appId, sessionKey);
                //
                // var data = pc.decryptData(encryptedData, iv);
                res.json({data: _data, message: '解密成功'});
            });
        }
    ).on('error', (e) => {
        console.error(e);
    });
});


module.exports = router;