const fs = require("fs");
const path = require("path");
const config = require('config-lite')(__dirname, '../config').mysql;
const env = process.env.NODE_ENV || "development";

let mysql = require('mysql');
let pool = mysql.createPool(config);

let getConnection = function (callback) {
    pool.getConnection(callback);
};
exports.query = function (sql, params, callback) {
    if (typeof params == 'function') {
        callback = params;
        params = null;
    }
    callback = callback || noop;

    getConnection(function (err, connection) {
        if (!err) {
            connection.query(sql, params, function (err, rows) {
                connection.release();
                if (err) {
                    _error(err);
                    return;
                }
                callback(rows);
            });

        } else {
            _error(err);
        }
    });
};

function _error (err) {
    console.log(err);
}
function noop () {

}

exports.execute = function (sql, params, callback) {
    if (typeof params == 'function') {
        callback = params;
        params = null;
    }
    callback = callback || noop;
    getConnection(function (err, connection) {
        if (!err) {
            connection.query(sql, params, function (err, result) {
                connection.release();
                if (err) {
                    _error(err);
                    return;
                }
                callback(result);
            });
        } else {
            _error(err);
        }
    });
};