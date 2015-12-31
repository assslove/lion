/**
 * Created by bin.hou on 2015/12/31.
 */

var request = require('request');

var DEFINE = require('./proto/define.js');

var model = module.exports;

var url = "http://www.qingzhugame.com/proto";

model.userCreate = function(name, cb) {
    var obj = {
        p : DEFINE.PROTO.USER_CREATE,
        s : 0,
        m : {
            uid : 123,
            name : name
        }
    };

    request.post(url, {
        form : {
            b : JSON.stringify(obj)
        }
    }, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var ret = JSON.parse(body);
            if (ret.r == 0) {
             //   console.log("success create user :" + ret.m.uid);
                cb(err, ret.m.uid);
            }
        } else {
            console.log(err);
        }
    });
}
