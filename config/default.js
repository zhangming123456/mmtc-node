module.exports = {
    mysql: {
        host: '120.79.6.97',
        user: 'yxdsuper',
        password: 'Iam@home',
        database: 'mmtc',
        timezone: '08:00'
    },
    session: {
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60
        }
    },
    token: {
        secret: 'react',
        expired: '1d'
    },
    wx_client: {//用户端小程序
        appid: 'wx0df0e298b3b13290',
        appsecret: '1e75825eb76fce6a7a769283b791a448'
    },
    wx: {//公众号
        appid: 'wx27285cd6edabc289',
        appsecret: 'bf8136db6a10ad106946c0569d357171'
    },
};