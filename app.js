// import express from 'express'
// import path from 'path'
// import logger from 'morgan'
// import cookieParser from 'cookie-parser'
// import * as bodyParser from 'body-parser';
// import * as jwt from 'jwt-simple';

Promise.prototype.finally = function (callback) {
    let P = this.constructor;
    return this.then(
        value => P.resolve(callback(value)).then(() => value),
        reason => P.resolve(callback(reason)).then(() => {
            throw reason
        })
    )
}

const os = require('os');
const cors = require('cors');
const rid = require('connect-rid');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler');
const express = require('express');
const path = require('path');
const fs = require('fs');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const proxy = require('http-proxy-middleware');
const history = require('connect-history-api-fallback');
const favicon = require('serve-favicon');
// var connect = require('connect');
const env = process.env.NODE_ENV || "development";


const index = require('./routes/index');

let app = express();
let parent_path = path.resolve(__dirname, '..');
// view engine setup
// 查看引擎设置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(history({
//     rewrites: [
//         {
//             from: /^\/shopapi\/.*$/,
//             to: function (context) {
//                 // console.log(context.parsedUrl.pathname);
//                 return context.parsedUrl.pathname;
//             }
//         }
//     ]
// }))
// uncomment after placing your favicon in /public
// 将您的图标放在/公开后取消注释
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('jwtTokenSecret', 'phpsucks!');
// // app.use(express.static(path.join(__dirname, '../mmtc-merchant-h5-master/dist')));
// app.use(favicon(path.join(__dirname, '../mmtc-merchant-h5-master/dist/static/favicon.ico')));

function setCustomCacheControl (res, path) {
    console.log('静态资源路径');
    res.set('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Credentials", true); //带cookies
    res.header("X-Powered-By", ' 3.2.1');
    if (serveStatic.mime.lookup(path) === 'text/html') {
        // Custom Cache-Control for HTML files
        // HTML文件的自定义缓存控制
        res.setHeader('Cache-Control', 'public, max-age=0')
    }
}

const StaticServe = serveStatic(path.join(__dirname, 'public'), {
    index: ['index.html', 'default.html', 'default.htm'],
    maxAge: '1d',
    setHeaders: setCustomCacheControl
})
app.use(StaticServe);

app.use(rid({
    headerName: 'X-RID'
}));
if (env !== "development") {
    // console.log(os.networkInterfaces(), 'mac地址');
    // 判断origin是否在域名白名单列表
    app.all('*', function (req, res, next) {
        let reqOrigin = req.headers.origin;
        // 设置CORS为请求的Origin值
        res.header("Access-Control-Allow-Origin", reqOrigin); //需要显示设置来源
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control, DNT, If-Modified-Since, Keep-Alive, User-Agent");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Credentials", true); //带cookies
        res.header("X-Powered-By", ' 3.2.1');
        res.header("Content-Type", "application/json;charset=utf-8");
        if (req.method === "OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
        else next();
    });
    const options = {
        target: 'https://app.mmtcapp.com', // 目标主机
        // target: 'http://192.168.3.28', // 目标主机？？
        // target: 'http://mmtc.mmapp', // 目标主机
        changeOrigin: true,// 需要虚拟主机站点
        ws: true,// 是否代理websocket
        xfwd: true,//转发真实ip
        router: {}
    };
    let exampleProxy = proxy(['/api/**', '/app/**', '/shopapi/**', `/poster/**`, `/operate/**`, `/services/**`], options);  //开启代理功能，并加载配置
    app.use(exampleProxy);//对地址为’/‘的请求全部转发
}


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// app.use('/static', express.static(path.join(__dirname, 'public')));

let task = require('./tasks/index');
task.addTask(require('./tasks/grouporder'));
// task.addTask(require('./tasks/groupmsg'))
task.addTask(require('./tasks/beanstalkd'));
task.start();


// var whitelist = ['http://example1.com', 'http://example2.com']
// var corsOptionsDelegate = function (req, callback) {
//     var corsOptions;
//     if (whitelist.indexOf(req.header('Origin')) !== -1) {
//         corsOptions = {origin: true} // reflect (enable) the requested origin in the CORS response
//     } else {
//         corsOptions = {origin: false} // disable CORS for this request
//     }
//     callback(null, corsOptions) // callback expects two parameters: error and options
// }

const whitelist = ['http://admin.mmtc', 'https://admin.mmtc', 'https://app.mmtcapp.com']
const corsOptions = {
    //Origin, X-Requested-With, Content-Type, Accept, Cache-Control, DNT, If-Modified-Since, Keep-Alive, User-Agent
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Cache-Control, DNT, If-Modified-Since, Keep-Alive, User-Agent',
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    "methods": "PUT,POST,GET,HEAD,PATCH,DELETE,OPTIONS", //PUT,POST,GET,DELETE,OPTIONS
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true
}
// , cors(corsOptions)
if (env !== "development") {
    app.use('/nodeapi', index);
} else {
    app.use('/', index);
}
// catch 404 and forward to error handler
// 捕获404并转发到错误处理程序

app.use(function (req, res, next) {
    const done = finalhandler(req, res)
    StaticServe(req, res, function onNext (err) {
        console.log(123123);
        if (err) return done(err);
        next();
    })
})
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    res.json({info: 'Not Found', status: 404});
    // next(err);
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    // 设置本地，只在开发中提供错误
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    // 渲染错误页面
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
