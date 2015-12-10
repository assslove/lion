/**
 * @brief 实用类
 */
var crypto = require('crypto');
var Long = require('long');

var utils = module.exports;

/* @brief 回调函数， 如果没有回调不会调用
 */
utils.invokeCallback = function(cb) {
    if (!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
}


utils.toHex = function(data) {
    var val = parseInt(data).toString(16);
    var str = "0000";
    var result = str + val;
    return "0x" + result.substring(val.length, result.length);
}

utils.toBin = function(data) {
    var val = parseInt(data).toString(2);
    var str = "";
    for (var i = 0; i < 32; ++i) {
        str += "0";
    }
    var result = str + val;
    return result.substring(val.length, result.length);
}

utils.randomInt = function(n) {
    return Math.ceil(Math.random() * 1000000000) % n;
}

/* @brief 返回从low-high的值
 */
utils.randomRange = function(low, high) {
    if (low > high) {
        var a = high;
        high = low;
        low = a;
    }

    return Math.ceil(Math.random() * 1000000000) % (high - low + 1) + low;
}

/* @brief 随机是否命中 100概率
 */
utils.isHitRandom = function(base) {
    return Math.ceil(Math.random() * 1000000000) % 100 <= base ? true : false;
}

utils.formatDate = function(timestamp)
{
    var now = new Date(timestamp * 1000);
    var year=now.getYear() + 1900;
    var month=now.getMonth()+1;
    month = month < 10 ? "0" + month : month;
    var date=now.getDate();
    date = date < 10 ? "0" + date : date;
    var hour=now.getHours();
    hour = hour < 10 ? "0" + hour : hour;
    var minute=now.getMinutes();
    minute = minute < 10 ? "0" + minute : minute;
    var second=now.getSeconds();
    second = second < 10 ? "0" + second : second;
    return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
}

utils.getCurTimeStr = function()
{
    var timestamp = Math.floor(new Date().getTime() / 1000);
    return utils.formatDate(timestamp);
}

utils.checksum = function(str, algorithm, encoding)
{
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}

utils.strToBin = function(str)
{
    var long = Long.fromString(str, true);
    var result = utils.toBin(long.getHighBitsUnsigned()) + utils.toBin(long.getLowBitsUnsigned());
    return result;
}

utils.clone = function(obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(utils.clone(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    o[j] = utils.clone(obj[j]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
}

utils.toArray = function(obj) {
    var arr = [];
    if (obj == null || obj.length == 0) return arr;

    for (var i in obj.length) {
        arr.push(obj[i]);
    }
    return arr;
}

utils.getRetMsg = function(code, msg) {
     return { c : code, m : msg};
}

utils.isNull = function(val) {
    return val === null || val === undefined || val === "";
}

utils.getCurTime = function() {
    return Math.floor(new Date().getTime()/1000);
}

utils.isDiffDay = function(chktm) {
    return new Date().getDate() != new Date(chktm * 1000).getDate();
}

utils.getClientIp = function(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress;
}
