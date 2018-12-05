let db = require('./db');
exports.query = function (sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, resolve);
    });
};
exports.execute = function (sql, params) {
    return new Promise((resolve, reject) => {
        db.execute(sql, params, resolve);
    });
};