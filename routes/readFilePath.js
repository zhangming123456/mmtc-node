var express = require('express');
var path = require('path');
var fs = require('fs');
var url = require('url');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
        var pathname = url.parse(req.url).pathname;
        console.log(pathname);
    }
);

function getReadFilePath(req, res, next, publicPath) {
    console.log(url.parse(req.url), '进入' + publicPath + '官网');
    var pathname = url.parse(req.url).pathname;
    var readDir = path.join(__dirname, publicPath || 'public');
    //默认路径是命令行的路径，而不是js文件的路径
    //不仅是html文件，所用到的资源(image、css、js等)都会在该函数被请求
    //html里的图片不能访问到它的上一级目录
    console.log('Request for pathname = ' + pathname);
    var subPathname = pathname.substr(1);
    if (!subPathname) {
        subPathname = 'index.html';
        if (!!publicPath) {
            res.redirect('/' + publicPath + '/index.html');
            return;
        }
    }
    if (!path.extname(subPathname)) {
        subPathname += '.html';
    }
    console.log('after modify pathname = ' + subPathname);
    var readPath = path.join(readDir, subPathname);
    console.log(readPath);
    fs.readFile(readPath, function (err, data) {
        if (!err) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        } else if (publicPath) {
            next();
        } else {
            fs.readFile(path.join(readDir, '404.html'), function (err, data) {
                if (!err) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(data);
                }
                else {
                    res.render('error', {title: 'error'});
                }
            });
        }
    })
}


module.exports = router;