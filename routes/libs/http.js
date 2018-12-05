let https = require("https");
let process = require("process");
let querystring = require("querystring");
let urlutil = require('url');

exports.post = function (url, params, callback, dataType) {
    if (typeof params == 'function') {
        callback = params;
        params = null;
    }
    dataType = dataType || 'json';
    let options = urlutil.parse(url);
    if (options.protocol == 'https:') {
        options.port = 443;
    } else {
        https = require('routes/libs/http');
    }
    if (typeof params == 'object') {
        params = querystring.parse(params);
    }
    options.headers = {
        "Content-Type": 'application/x-www-form-urlencoded',
        "Content-Length": Buffer.byteLength(params, 'utf8')
    };
    options.method = 'POST';
    let req = https.request(options, function (res) {
        var datas = [];
        var size = 0;
        res.on('data', function (data) {
            datas.push(data);
            size += data.length;
        });
        res.on('end', function () {
            var buff = Buffer.concat(datas, size);
            var result;
            if (dataType == 'binary') {
                result = buff;
            } else if (dataType == 'json') {
                result = buff.toString();
                try {
                    result = JSON.parse(result);
                } catch (e) {

                }
            } else if (dataType == 'base64') {
                result = buff.toString('base64');
            } else {
                result = buff.toString();
            }
            callback && callback(result);
        });
    });
    req.write(params);
    req.on('error', function (e) {
        console.log(e);
    });
    req.end();
};
exports.get = function (url, params, callback, dataType) {
    if (typeof params == 'function') {
        callback = params;
        params = null;
    }
    dataType = dataType || 'json';
    if (params) {
        let paramStr = '';
        if (Object.prototype.toString.call(params) == '[object Array]') {
            if (params.length) {
                let paramAttr = [];
                for (let key in params) {
                    let v = encodeURIComponent(params[key]);
                    paramAttr.push(`${key}=${v}`);
                }
                paramStr = paramAttr.join('&');
            }
        } else {
            paramStr = params;
        }
        if (paramStr) {
            if (url.indexOf('?') == -1) {
                url += '&';
            } else {
                url += '?';
            }
            url += paramStr;
        }
    }
    https.get(url, function (res) {
        var datas = [];
        var size = 0;
        res.on('data', function (data) {
            datas.push(data);
            size += data.length;
        });
        res.on('end', function () {
            var buff = Buffer.concat(datas, size);
            var result = buff.toString();
            if (dataType == 'json') {
                result = JSON.parse(result);
            }
            callback && callback(result);
        });
    });
};