function _w (num) {
    return num >= 10 ? num : '0' + num;
}

exports.int2time = function (timestamp) {
    var datetime = new Date();
    datetime.setTime(timestamp);
    var year = datetime.getFullYear();
    var month = _w(datetime.getMonth() + 1);
    var date = _w(datetime.getDate());
    var hour = _w(datetime.getHours());
    var minute = _w(datetime.getMinutes());
    var second = _w(datetime.getSeconds());
    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
};
