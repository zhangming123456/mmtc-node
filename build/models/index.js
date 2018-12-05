"use strict";
var fs = require("fs");
var path = require("path");
var Sequelize = require('sequelize');
var config = require('config-lite')(__dirname, '../config').mysql;
var env = process.env.NODE_ENV || "development";
var db = {};
var sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: '+08:00',
});
sequelize
    .authenticate()
    .then(function () {
    console.log('数据库连接成功');
})
    .catch(function (err) {
    console.error('数据库连接失败', err);
});
sequelize.sync();
fs
    .readdirSync(__dirname)
    .filter(function (file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
})
    .forEach(function (file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
});
Object.keys(db).forEach(function (modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});
// 检查角色表是否为空。
db['role_tbl'].findAll()
    .then(function (results) {
    if (results.length === 0) {
        db['role_tbl'].create({ name: '普通用户' }); //  role of admin
        db['role_tbl'].create({ name: '系统管理员' }); // role of normal user
    }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;
//# sourceMappingURL=index.js.map