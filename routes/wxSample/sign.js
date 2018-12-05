"use strict";
const config = require("config-lite")(__dirname, '../config').wx;
var sha1 = require('node-sha1');
let createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
};

let createTimestamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
};

let raw = function (args) {
    let keys = Object.keys(args);
    keys = keys.sort();
    let newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    let string = '';
    for (let k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
};

/**
 * @synopsis 签名算法
 *
 * @param jsapi_ticket 用于签名的 jsapi_ticket
 * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
 *
 * @returns
 */
let sign = function (jsapi_ticket, url, appid) {
    let ret = {
        jsapi_ticket: jsapi_ticket,
        nonceStr: createNonceStr(),
        timestamp: createTimestamp(),
        url: url
    };
    let string = raw(ret);
    console.log(string);
    ret.signature = sha1(string);
    ret.appid = appid;
    return ret;
};

module.exports = sign;
