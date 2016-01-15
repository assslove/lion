/**
 * Created by bin.hou on 2016/1/15.
 */

var encrypt = module.exports;

var privateKey = "BJ5XJBPuhiuAuWLUyMhnWkVUkdd9cpQN3vdt9glWd6vHh4w87iZZK3wzlmG4JoWD";
var keyTable = [];

encrypt.init = function() {
    for (var i in privateKey) {
        keyTable[i] = privateKey.charCodeAt(i);
    }
}

/* @brief 加密
 */
encrypt.encode = function(src) {
    var dest = "";
    for (var i = 0; i < src.length; ++i) {
        dest += String.fromCharCode(src.charCodeAt(i) ^ keyTable[i % 64]);
    }
    return dest;
}

/* @brief 减密
 */
encrypt.decode = function(src) {
    var dest = "";
    for (var i = 0; i < src.length; ++i) {
        dest += String.fromCharCode(src.charCodeAt(i) ^ keyTable[i % 64]);
    }
    return dest;
}

//测试
//encrypt.init();
//var test = {"name" : "你好", "uid" : 100002};
//var base64Str =  new Buffer(JSON.stringify(test)).toString('base64');
//var encodeStr = encrypt.encode(base64Str);
//var decodeStr = encrypt.decode(encodeStr);
//var normalStr = new Buffer(decodeStr, 'base64').toString();
//console.log(normalStr);