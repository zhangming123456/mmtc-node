/**
 * Created by Aaronzm on 2018/9/22.
 */
"use strict";
const fs = require('fs');
const path = require('path');
let express = require('express');
const _ = require('lodash');

const Wechat = require('wechat-jssdk');
const WechatAPI = require('wechat-api');
const config = require('config-lite')(__dirname, '../config').wx;
const wxhelper = require('../../helpers/wx');
const queryString = require('querystring');
const sign = require('../wxSample/sign');//上面的签名算法
const {httpsRequest} = require('../libs/utils');
let router = express.Router();

// const Store = require('wechat-jssdk').Store;
//
// class CustomStore extends Store {
//     constructor (options) {
//         super(options);
//     }
//
//     /**
//      * get the global token from store.
//      * 从商店获取全局令牌。
//      */
//     getGlobalToken () {
//
//     }
//
//     /**
//      * 更新要存储的全局令牌。
//      * update the global token to store.
//      * @param newTokenInfo
//      */
//     updateGlobalToken (newTokenInfo) {
//
//     }
//
//
//     // implement the apis in base Store class, e.g.
//     // 在基本Store类中实现apis，例如
//     /**
//      * 获取当前页面的url签名。
//      * get url signature for the current page.
//      * @param url
//      * @returns {*|Promise<any>}
//      */
//     getSignature (url) {
//         return super.getSignature(url).finally((sig) => {
//             if (!_.isEmpty(sig)) {
//                 return Promise.resolve(sig);
//             }
//             // now you may try get it from like redis
//             // 现在你可以试试像redis一样
//             return this.getFromRedis(url).then((sig) => {
//                 if (!_.isEmpty(sig)) {
//                     //store it in memory, so that it can be retrieved from memory directly next time
//                     // 将它存储在内存中，以便下次可以直接从内存中检索它
//                     //without getting it from redis again
//                     // 没有从redis再次获得它
//                     this.store.urls[url] = sig;
//                 }
//                 return Promise.resolve(sig);
//             });
//         });
//     }
//
//     /**
//      * 将新签名保存到store。
//      * save new signature to store.
//      * @param url
//      * @param signatureInfo
//      */
//     saveSignature (url, signatureInfo) {
//
//     }
//
//     /**
//      * 更新现有的url签名，就好像它已过期一样
//      * update the existing url signature, like if it's expired
//      * @param url
//      * @param newInfo
//      */
//     updateSignature (url, newInfo) {
//
//     }
//
//     /**
//      * 检查传递的url的签名是否存在。
//      * check if the signature for the passed url exists.
//      * @param url
//      */
//     isSignatureExisting (url) {
//
//     }
//
//     /**
//      * 通过唯一键获取缓存的oauth标记。
//      * get cached oauth token by the unique key.
//      * @param key
//      */
//     getOAuthAccessToken (key) {
//
//     }
//
//     /**
//      * 保存新的oauth令牌。
//      * save new oauth token.
//      * @param key
//      * @param info
//      */
//     saveOAuthAccessToken (key, info) {
//
//     }
//
//     /**
//      * 更新oauth令牌，就好像它已过期一样。
//      * update the oauth token, like if it's expired.
//      * @param key
//      * @param newInfo
//      */
//     updateOAuthAccessToken (key, newInfo) {
//
//     }
//
//     /**
//      * 将内存信息刷新到持久存储。
//      * flush in memory info to persistent store.
//      * @returns {Promise<T>}
//      */
//     flush () {
//         return Promise.all([
//             this.flushGlobalToken(),
//             this.flushSignatures(),
//             this.flushOAuthTokens()
//         ]).then(() => super.flush()).catch(() => super.flush());
//     }
//
//     /**
//      * 销毁当前的商店实例，做一些清算。
//      * destroy the current store instance, do some clearing.
//      */
//     destroy () {
//         //some method to clean connections
//         // 一些清理连接的方法
//         this.closeRedisConns();
//         super.destroy();
//         debug('redisStore destroyed!');
//     }
//
//
//     getFromRedis (url) {
//
//     }
//
//     closeRedisConns () {
//
//     }
// }


const FileStore = Wechat.FileStore;
const Store = new FileStore({
    interval: 1000 * 60 * 3,
    //where to save the json file, default: ${process.cwd()}/wechat-info.json
    // 在哪里保存json文件，默认：$ {process.cwd（）} / wechat-info.json
    fileStorePath: './my-wechat-info.json',
})

let wechatInfo = {
    appId: config.appid, //required
    appSecret: config.appsecret, //required
    wechatRedirectUrl: "https://app.mmtcapp.com",//第一个为设置网页授权回调地址
    wechatToken: "", // 第一次在微信控制台保存开发者配置信息时使用
    card: true, ////开启卡券支持，默认关闭
    payment: false, ////开启支付支持，默认关闭
    merchantId: '',//商户ID
    paymentSandBox: true, ////沙箱模式，验收用例
    paymentKey: '', ////必传，验签密钥，TIP:获取沙箱密钥也需要真实的密钥，所以即使在沙箱模式下，真实验签密钥也需要传入。
    // pfx 证书
    // paymentCertificatePfx: fs.readFileSync(path.join(process.cwd(), 'cert/apiclient_cert.p12')),
    //默认微信支付通知地址
    paymentNotifyUrl: `https://app.mmtcapp.com/nodeapi/wechat/payment`,
    // store: new CustomStore({}),
    store: Store,
};
const wx = new Wechat(wechatInfo);

console.log(config);

// const wxApi = new WechatAPI(config.appid, config.appsecret,
//     // function (callback) {
//     //     // 传入一个获取全局token的方法
//     //     fs.readFile('access_token.txt', 'utf8', function (err, txt) {
//     //         if (err) {
//     //             return callback(err);
//     //         }
//     //         callback(null, JSON.parse(txt));
//     //     });
//     // },
//     // function (token, callback) {
//     //     // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
//     //     // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
//     //     fs.writeFile('access_token.txt', JSON.stringify(token), callback);
//     // }
// );
// const wxApi = new API(config.appid, config.appsecret);


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: '微信端'});
});
/**
 * 微信登入
 */
router.get('/redirectUrl', function (req, res, next) {
    let redirect_uri = req.query.redirect_uri;
    let scope = req.query.scope;
    let state = req.query.state;
    let data = {
        appid: config.appid,
        redirect_uri: decodeURIComponent(redirect_uri),
        response_type: 'code',
        scope: 'snsapi_base',
    };
    console.log(data);
    if (scope) {
        data.scope = 'snsapi_userinfo'
    }
    if (state) {
        data.state = state
    }
    if (!redirect_uri) {
        res.render('index', {title: '没有当前重定向页面'});
        return;
    }
    let src = queryString.stringify(data);
    let uri = `https://open.weixin.qq.com/connect/oauth2/authorize?${src}#wechat_redirect`;
    console.log(uri);
    res.redirect(uri);
    // res.json({
    //     status: 1,
    //     info: {
    //         url: uri
    //     }
    // })
});

router.get('/oauth-userInfo', function (req, res) {
    const key = '123123';
    //得到code，获取用户信息
    wx.oauth.getUserInfo(req.query.code, key).then(
        function (userProfile) {
            console.log(userProfile, "userProfile");
            res.json({
                info: userProfile,
                status: 1
            });
        },
        function (userProfile) {
            res.json({
                info: userProfile || '请求错误~',
                status: 0
            });
        }
    )
        .catch(function (userProfile) {
            res.json({
                info: userProfile.errmsg,
                status: userProfile.errcode
            });
        });
});

router.get('/getSignature', async function (req, res) {
    let url = req.query.url
    if (!url) {
        res.json({
            status: 0,
            info: ''
        });
        return;
    }
    await wx.jssdk.getSignature(url).finally(function (signatureDate) {
        if (signatureDate.errcode) {
            res.json({
                info: signatureDate.errmsg,
                status: signatureDate.errcode
            });
        } else {
            res.json({
                info: signatureDate,
                status: 1
            });
        }
    });
});

module.exports = router;
