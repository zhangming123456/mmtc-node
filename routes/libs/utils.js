const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const querystring = require('querystring');
const Crypto = require("crypto");
const rename = require('gulp-rename');

const os = require('os');

const transliteration = require('transliteration')

class httpRequest {
    constructor (host, port = '') {
        this.host = host;
        this.port = port;
    }

    get () {
        let that = this,
            path = arguments[0],
            data = arguments[1];
        if (typeof arguments[0] === 'object') {
            path = arguments[1];
            data = arguments[0];
        }
        return new Promise(function (resolve, reject) {
            data && (path += '?' + querystring.stringify(data));
            let options = {
                host: that.host, // 这个不用说了, 请求地址
                port: that.port,
                path: path, // 具体路径, 必须以'/'开头, 是相对于host而言的
                method: 'GET', // 请求方式, 这里以post为例
                headers: { // 必选信息, 如果不知道哪些信息是必须的, 建议用抓包工具看一下, 都写上也无妨...
                    'Content-Type': 'application/json'
                }
            };
            http.get(options, function (res) {
                const {statusCode} = res;
                const contentType = res.headers['content-type'];
                let error;
                if (statusCode !== 200) {
                    error = new Error('请求失败。\n' +
                        `状态码: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error('无效的 content-type.\n' +
                        `期望 application/json 但获取的是 ${contentType}`);
                }
                if (error) {
                    console.error(error.message);
                    // 消耗响应数据以释放内存
                    res.resume();
                    reject();
                    return;
                }

                res.setEncoding('utf8');
                let rawData = "";
                res.on("data", function (data) {
                    rawData += data;
                });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(JSON.parse(rawData));
                        console.log(parsedData);
                    } catch (e) {
                        reject();
                        console.error(e.message);
                    }
                });
            }).on('error', (e) => {
                reject(e);
                console.error(`错误: ${e.message}`);
            });
        })
    }

    post () {
        let that = this,
            path = arguments[0],
            data = arguments[1];
        if (typeof arguments[0] === 'object') {
            path = arguments[1];
            data = arguments[0];
        }
        return new Promise(function (resolve, reject) {
            let options = {
                host: that.host, // 这个不用说了, 请求地址
                port: that.port,
                path: path, // 具体路径, 必须以'/'开头, 是相对于host而言的
                method: 'POST', // 请求方式, 这里以post为例
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(data)
                }
            };
            let req = http.request(options, function (res) {
                const {statusCode} = res;
                const contentType = res.headers['content-type'];
                let error;
                if (statusCode !== 200) {
                    error = new Error('请求失败。\n' +
                        `状态码: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error('无效的 content-type.\n' +
                        `期望 application/json 但获取的是 ${contentType}`);
                }
                if (error) {
                    console.error(error.message);
                    // 消耗响应数据以释放内存
                    res.resume();
                    reject();
                    return;
                }

                res.setEncoding('utf8');
                let rawData = "";
                res.on("data", function (data) {
                    rawData += data;
                });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(JSON.parse(rawData));
                        console.log(parsedData);
                    } catch (e) {
                        reject();
                        console.error(e.message);
                    }
                });
            });
            req.on('error', (e) => {
                reject(e);
                console.error(`错误: ${e.message}`);
            });

            req.write(data);
            req.end();
        })
    }
}

class httpsRequest {
    constructor (host, port = '') {
        this.host = host;
        this.port = port;
    }

    get () {
        let that = this,
            path = arguments[0],
            data = arguments[1];
        if (typeof arguments[0] === 'object') {
            path = arguments[1];
            data = arguments[0];
        }
        return new Promise(function (resolve, reject) {
            data && (path += '?' + querystring.stringify(data));
            let options = {
                host: that.host, // 这个不用说了, 请求地址
                port: that.port,
                path: path, // 具体路径, 必须以'/'开头, 是相对于host而言的
                method: 'GET', // 请求方式, 这里以post为例
                headers: { // 必选信息, 如果不知道哪些信息是必须的, 建议用抓包工具看一下, 都写上也无妨...
                    'Content-Type': 'application/json'
                }
            };
            https.get(options, function (res) {
                const {statusCode} = res;
                const contentType = res.headers['content-type'];
                let error;
                if (statusCode !== 200) {
                    error = new Error('请求失败。\n' +
                        `状态码: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error('无效的 content-type.\n' +
                        `期望 application/json 但获取的是 ${contentType}`);
                }
                if (error) {
                    console.error(error.message);
                    // 消耗响应数据以释放内存
                    res.resume();
                    reject();
                    return;
                }

                res.setEncoding('utf8');
                let rawData = "";
                res.on("data", function (data) {
                    rawData += data;
                });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(JSON.parse(rawData));
                        console.log(parsedData);
                    } catch (e) {
                        reject();
                        console.error(e.message);
                    }
                });
            }).on('error', (e) => {
                reject(e);
                console.error(`错误: ${e.message}`);
            });
        })
    }

    post () {
        let that = this,
            path = arguments[0],
            data = arguments[1];
        if (typeof arguments[0] === 'object') {
            path = arguments[1];
            data = arguments[0];
        }
        return new Promise(function (resolve, reject) {
            let options = {
                host: that.host, // 这个不用说了, 请求地址
                port: that.port,
                path: path, // 具体路径, 必须以'/'开头, 是相对于host而言的
                method: 'POST', // 请求方式, 这里以post为例
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(data)
                }
            };
            let req = https.request(options, function (res) {
                const {statusCode} = res;
                const contentType = res.headers['content-type'];
                let error;
                if (statusCode !== 200) {
                    error = new Error('请求失败。\n' +
                        `状态码: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error('无效的 content-type.\n' +
                        `期望 application/json 但获取的是 ${contentType}`);
                }
                if (error) {
                    console.error(error.message);
                    // 消耗响应数据以释放内存
                    res.resume();
                    reject();
                    return;
                }

                res.setEncoding('utf8');
                let rawData = "";
                res.on("data", function (data) {
                    rawData += data;
                });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(JSON.parse(rawData));
                        console.log(parsedData);
                    } catch (e) {
                        reject();
                        console.error(e.message);
                    }
                });
            });
            req.on('error', (e) => {
                reject(e);
                console.error(`错误: ${e.message}`);
            });

            req.write(data);
            req.end();
        })
    }
}

class crypto {
    constructor (pass) {
    }

    md5 (password) {
        const md5 = Crypto.createHash('md5');
        return md5.update(password).digest('hex');
    }

    base64 (txt) {
        return new Buffer(txt).toString('base64');
    }

    ucfirst (str) {
        var str = str.toLowerCase();
        str = str.replace(/\b\w+\b/g, function (word) {
            return word.substring(0, 1).toUpperCase() + word.substring(1);
        });
        return str;
    }

    getClientIp (req) {
        try {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress || '';
            if (ip) {
                ip = ip.match(/\d+.\d+.\d+.\d+/);
            }
            return ip ? ip.join('.') : '';
        } catch (err) {
            return ''
        }
    }

    getIdentifier (req) {
        const clientIp = this.getClientIp(req);
        let networkInterfaces = os.networkInterfaces();
        let mac = '你们都去死'
        let Ethernet = networkInterfaces['以太网']
        let WIFI = networkInterfaces['WIFI']
        if (Ethernet) {
            let obj = Ethernet.find(function (v) {
                if (v.family === "IPv4") {
                    return true;
                }
            });
            if (obj) {
                mac = obj.mac
            }
        } else if (WIFI) {
            let obj = WIFI.find(function (v) {
                if (v.family === "IPv4") {
                    return true;
                }
            });
            if (obj) {
                mac = obj.mac
            }
        }
        return {
            id: this.md5(mac + clientIp),
            ip: clientIp,
            mac: mac
        }
    }
}

const UUID = {
    v1 () {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    },
    v2 () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    v3 () {
        function S4 () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    },
    v5 (len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [], i;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    }
}

class FileUtil extends crypto {
    constructor () {
        super();
        this.imageType = 'bmp,jpg,png,gif,svg,webp';
        this.fontType = 'ttf,eof,woff,woff,otf';
    }

    getSuffixName (fileName = '') {
        if (!fileName.trim()) return '';
        let index1 = fileName.lastIndexOf(".");
        let index2 = fileName.length;
        let suffixName = fileName.substring(index1, index2);//后缀名
        suffixName = suffixName.replace('.', '');
        if (this.imageType.indexOf(suffixName.toLowerCase()) > -1) {
            return suffixName
        } else if (this.fontType.indexOf(suffixName.toLowerCase()) > -1) {
            return suffixName
        } else {
            return ''
        }
    }


    getFilePublicPath (fontName) {
        return path.join(__dirname, `../../public/${fontName}`);
    }

    getFilePath (fontName, defaultSuffix = 'png') {
        let SuffixName = this.getSuffixName(fontName);
        if (this.imageType.indexOf(SuffixName || defaultSuffix)) {
            return path.join(__dirname, `../../public/image/${this.md5(fontName)}.${SuffixName || defaultSuffix}`);
        } else {
            return ''
        }
    }
}

const Fontmin = require('fontmin');
let Fontmins = {}

class FontminUtil extends FileUtil {
    constructor () {
        super();
    }

    /**
     * 获取压缩字体
     * @param txt
     * @param srcPath 字体源文件
     * @param fontFamily 字体
     * @param callback 回调
     */
    getFonts (txt, srcPath, fontFamily, callback) {
        console.log(txt, srcPath, fontFamily);
        let that = this;
        let name = this.md5(txt);
        name = name.substring(0, 4) + name.substring(name.length - 4);
        const fileName = `css/font/${name}`;
        let fontPath = fileName + '/mini';
        const destPath = this.getFilePublicPath(fileName);    // 输出路径
        fs.exists(destPath, function (exists) {
            if (exists) {
                callback && callback({
                    path: fontPath + '.css',
                    fontFamily: `font${name}`,
                    txt: txt
                });
            } else {
                let exp = that.getSuffixName(srcPath);
                let fontmin = new Fontmin();
                if (Fontmins[that.md5(srcPath)]) {
                    fontmin = Fontmins[that.md5(srcPath)]
                }
                fontmin.src(srcPath)               // 输入配置
                    .use(Fontmin.glyph({        // 字型提取插件
                        text: txt              // 所需文字
                    }))
                    .use(rename('mini.' + exp));

                if (exp.toLowerCase() === 'ttf') {
                    // eot 转换插件
                    // svg 转换插件
                    fontmin.use(Fontmin.ttf2svg())
                } else if (exp.toLowerCase() === 'svg') {
                    fontmin.use(Fontmin.svg2ttf());
                } else if (exp.toLowerCase() === 'otf') {
                    fontmin.use(Fontmin.otf2ttf())
                } else {
                    callback && callback();
                    return;
                }
                // css 生成插件
                fontmin.use(Fontmin.ttf2eot())
                    .use(Fontmin.ttf2woff())    // woff 转换插件
                    .use(Fontmin.css({
                        // fontPath: `http://192.168.3.191:3000/css/font/${name}/`,
                        iconPrefix: name,
                        // base64: true,
                        fontFamily: `font${name}`//  自定义fontFamily，默认为filename或从分析的ttf文件中获取
                    }))
                    .dest(destPath);            // 输出配置
                // 执行
                fontmin.run(function (err, files, stream) {
                    if (err) {                  // 异常捕捉
                        console.error(err);
                        callback && callback();
                    }
                    callback && callback({
                        path: fontPath + '.css',
                        fontFamily: `font${name}`,
                        txt: txt,
                        stream
                    });
                    console.log('done');        // 成功
                });
            }
        })
    }
}


module.exports = {
    httpRequest,
    httpsRequest,
    crypto,
    FileUtil,
    FontminUtil
};
