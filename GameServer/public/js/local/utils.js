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


/* @brief 各应用模拟列表
 */
var MODELS = {
    1 : {name : 'tool', desc : '工具', info : ''}
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
