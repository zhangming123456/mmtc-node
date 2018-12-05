const Beanstalk = require('beanstalk-promises')
const db = require('../db/db2');
const wxhelper = require('../helpers/wx');
let client = new Beanstalk();
let handlers = {};
const env = process.env.NODE_ENV || "development";
console.log(env, '环境变量');
function handler (job, next) {
    job.data.op && handlers[job.data.op](job, next);
}
async function main (next) {
    if (env === 'development') {
        await client.connect('127.0.0.1', 11300, 1000)
        await client.watchTube('flux')
    }
    let job;
    try {
        if (env === 'development') {
            job = await client.getJob();
        }
        handler(job, next);
        if (env === 'development') {
            await client.deleteJob(job);
        }
    } catch (e) {
        if (job && env === 'development') {
            await client.deleteJob(job);
        }
    }
    next();
    if (env === 'development') {
        client.quit();
    }
}
module.exports = main;
handlers.pay_success = async function (job, next) {
    job = job.data;
    let pages = '/pages/index/index';
    let order_id = job.order_id;
    let rows = await db.query('select o.total,m.openid,o.order_no,o.pay_time,o.member_id from order_bill o inner join member m on m.id=o.member_id where o.id=?', [order_id]);
    if (rows && rows.length) {
        rows.forEach(async el => {
            if (!el.pay_time) {
                return;
            }
            let form_id = await wxhelper.getFormId(el.member_id);
            if (form_id) {
                let order_infos = await db.query('select i.title from order_info oi inner join item i on i.id=oi.item_id where oi.bill_id=' + order_id);
                if (!order_infos || !order_infos.length) {
                    return;
                }
                let title = order_infos[0].title;
                if (order_infos.length > 1) {
                    title += '等' + order_infos.length + '件商品/服务';
                }
                wxhelper.sendTemplate({
                    touser: el.openid,
                    template_id: 'xK5xiYP4pOFGtqfnGoSQqhxzEBY-wpTC49jMQ3ts6NI',
                    form_id: form_id,
                    page: pages,
                    data: {
                        keyword1: {
                            value: el.order_no,
                            color: "#173177"
                        },
                        keyword2: {
                            value: el.pay_time,
                            color: "#173177"
                        }
                        , keyword3: {
                            value: title,
                            color: "#173177"
                        }
                        , keyword4: { //支付金额
                            value: el.total + '元',
                            color: "#173177"
                        }
                        , keyword5: { //温馨提示
                            value: '支持成功',
                            color: "#ff0000"
                        }
                    }
                    // emphasis_keyword: 'keyword6.DATA'
                });
            }
        });
    }
};  