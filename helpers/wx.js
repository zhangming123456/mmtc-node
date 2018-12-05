const wxconfig = require('config-lite')(__dirname, '../config').wx_client;
console.log(wxconfig);
let https = require('../routes/libs/http');
const db = require('../db/db2');
let token, expires_time;
exports.sendTemplate = function (options) {
    exports.getAccessToken(function (token) {
        options = JSON.stringify(options);
        let url = `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${encodeURIComponent(token)}`;
        https.post(url, options, function (rs) {
            if (rs.errcode) {
                console.error(rs);
            } else {
                console.log('tuisong msg:' + JSON.stringify(rs));
            }
        });
    });
};
exports.getAccessToken = function (callback) {
    if (token && expires_time > (new Date().getTime())) {
        callback(token);
        return;
    }
    https.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wxconfig.appid}&secret=${wxconfig.appsecret}`, function (res) {
        if (res.errcode) {
            console.error(res.errmsg);
        } else {
            token = res.access_token;
            expires_time = res.expires_in + (new Date()).getTime() - 20;
            callback(token);
        }
    });
};

exports.getFormId = async function (member_id) {
    let sql = 'select form_id,id from member_formids where member_id=' + member_id +
        " and create_time > unix_timestamp(now())-604800 limit 1";
    let formidRows;
    (formidRows = await db.query(sql)) && formidRows.length &&
    db.execute('delete from member_formids where id=' + formidRows[0].id);
    if (formidRows && formidRows.length) {
        return formidRows[0].form_id;
    }
    return null;
};