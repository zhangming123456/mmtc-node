"use strict";

const fs = require("fs");
const path = require("path");
let Sequelize = require('sequelize');
const Config = require('config-lite')(__dirname, '../config');
const env = process.env.NODE_ENV || "development";
const config = Config.mysql;
const {crypto} = require('../routes/libs/utils');

let db = {};

let sequelize = new Sequelize(config.database, config.user, config.password, {
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
    .then(() => {
        console.log('数据库连接成功');
    })
    .catch(err => {
        console.error('数据库连接失败', err);
    });
sequelize.sync().then(
    req => {
        // 检查角色表是否为空。
        db['role_tbl'].findAll()
            .then((results) => {
                if (results.length === 0) { // 如果角色为空，则添加两条记录以避免错误。
                    db['role_tbl'].create({name: '普通用户'}); //  role of admin
                    db['role_tbl'].create({name: '系统管理员'}); // role of normal user
                }
            });
        db[`user_tbl`].findAll()
            .then(results => {
                if (results.length === 0) {
                    db['user_tbl'].create({
                        username: 'admin',
                        password: new crypto().md5('123456'),
                        role: 2
                    }); //  role of admin
                    db['user_tbl'].create({
                        username: 'admin2',
                        password: new crypto().md5('123456'),
                        role: 2
                    }); //  role of admin
                }
            });
    }
);
fs
    .readdirSync(__dirname)
    .filter(
        (file) => {
            return (file.indexOf(".") !== 0) && (file !== "index.js");
        }
    )
    .forEach((file) => {
        let model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;