let https = require('../routes/libs/http');
let wxhelper = require('../helpers/wx');
let util = require('../helpers/util');
let db = require('../db/db');

function sendTemplate (el, element, formid) {
    wxhelper.sendTemplate({
        touser: el.openid,
        template_id: '67S1veYseXQILSun35xuFxM3Y_Y301nwoFVJS-ZZZhI',
        form_id: formid,
        page: "/pages/index/index",
        data: {
            keyword1: {
                value: element.title,
                color: "#173177"
            },
            keyword2: {
                value: el.order_no,
                color: "#173177"
            }
            , keyword3: {
                value: element.group_price + '元',
                color: "#173177"
            }
            , keyword4: { //开团时间
                value: util.int2time(element.create_time * 1000),
                color: "#173177"
            }
            , keyword5: { //失败原因
                value: '24小时不成团',
                color: "#173177"
            },
            keyword6: { //订单状态
                value: '拼团失败，退款中',
                color: "#173177"
            },
            keyword7: {
                value: element.group_price + '元',
                color: "#173177"
            }
        }
        // ,
        // emphasis_keyword: 'keyword6.DATA'
    });
}

module.exports = function (next) {
    //24小时过期的团购订单
    db.query("select i.title,g.id,m.openid,g.create_time,g.group_id,g.num group_num,g.price group_price,g.num_used from group_purchase_open g "
        + " inner join member m on m.id=g.member_id"
        + " inner join item i on i.id=g.group_id where g.num>g.num_used and g.status=0 and g.create_time<unix_timestamp(now())-86400", function (rows) {
        rows.forEach(element => {
            let num_used = parseInt(element.num_used);
            if (num_used == 0) { // has no payed
                db.execute(`delete from group_purchase_open where id=${element.id}`);
            } else { // is timeout
                db.execute('update group_purchase_open set status=1 where id=' + element.id);
                //send template  所有某个团的参与者，收到推送
                db.query('select m.openid,bill.order_no,rmo.id,rmo.member_id,rmo.is_noticed from rel_member_open rmo '
                    + 'inner join member m on m.id=rmo.member_id'
                    + ' inner join order_bill bill on bill.id=rmo.bill_id'
                    + ' where rmo.open_id=? and rmo.is_noticed=?', [
                    element.id,
                    0
                ], function (opens) {
                    opens.forEach(function (el) {
                        db.execute('update rel_member_open set is_noticed=1 where id=' + el.id);
                        if (el.openid) {
                            let sql = 'select form_id,id from member_formids where member_id=' + el.member_id +
                                " and create_time > unix_timestamp(now())-604800 limit 1";
                            db.query(sql, function (formidRows) {
                                formidRows.forEach(function (formIdEl) {
                                    db.execute('delete from member_formids where id=' + formIdEl.id);
                                    sendTemplate(el, element, formIdEl.form_id);
                                });
                            });
                        }
                    });
                });
            }
        });
        next();
    }.bind(this));
};