"use strict";
const env = process.env.NODE_ENV || "development";
let io = require('socket.io')();

const wsFonts = require('../fonts/wsFonts');

let path = '';
if (env !== "development") {
    path = '/nodeapi'
}

wsFonts.listen(io, `${path}/wsFonts`);

io.on('connection', function (socket) {
    socket.on('disconnect', function () {

    });
    socket.on('login', function (user, callback) {
        user.id = socket.id;
        io.emit('userList', {ud: 8908008}); // 发送给所有的用户
        console.log('登入了', user);
        callback(766);
        //发送给出自己外的用户
    });
}) // 使用这段代码进行socket的连接


exports.listen = function (_server) {
    console.log('启动socket服务');
    io.listen(_server);
};