/**
 * Created by bin.hou on 2015/5/21.
 */

function formatDate(timestamp) {
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

function getDateStr() {
    var now = new Date();
    var year=now.getYear() + 1900;
    var month=now.getMonth()+1;
    month = month < 10 ? "0" + month : month;
    var date=now.getDate();
    date = date < 10 ? "0" + date : date;
    return year+""+month+""+date;
}

function getTime(cur) {
    return Math.floor(new Date(cur).getTime()/1000.0);
}

/* @brief 各应用模拟列表
 */
var MODELS = {
    1 : {name : 'tool', desc : '后台工具', info : '后台工具'},
    2 : {name : 'sysmail', desc : '系统邮件', info : '系统邮件'},
    3 : {name : 'user', desc : '用户管理', info : '用户管理'}
};

function arrayBufferConcat () {
    var length = 0;
    var buffer = null;

    for (var i in arguments) {
        buffer = arguments[i];
        length += buffer.byteLength;
    }

    var joined = new Uint8Array(length);
    var offset = 0

    for (var i in arguments) {
        buffer = arguments[i];
        joined.set(new Uint8Array(buffer), offset);
        offset += buffer.byteLength;
    }

    return joined.buffer;
}

function strToArrayBuffer(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}