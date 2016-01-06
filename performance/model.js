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
                cb(err, ret.m.uid);
            }
        } else {
            console.log(err);
        }
    });
}

model.userLogin = function(uid, cb) {
    var obj = {
        p : DEFINE.PROTO.USER_LOGIN,
        s : 0,
        m : {
            uid : uid
        }
    };

    request.post(url, {
        form : {
            b : JSON.stringify(obj)
        }
    }, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var ret = JSON.parse(body);
            cb(err, ret.r);
        } else {
            console.log(err);
        }
    });
}

model.userSyncInfo = function(uid, cb) {
    var obj = {
        p : DEFINE.PROTO.USER_SYNC_INFO,
        s : 0,
        m : {
            uid : uid,
            head_icon:1,
            max_copy:1000,
            cash:12000,
            gold:15000000,
            hp:45630,
            copy_stars:800,
            use_pet : 1000,
            name : 'test'
        }
    };

    request.post(url, {
        form : {
            b : JSON.stringify(obj)
        }
    }, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var ret = JSON.parse(body);
            cb(err, ret.r);
        } else {
            console.log(err);
        }
    });
}

model.userSyncItem = function(uid, cb) {
    var items = [];
    for (var i = 0; i < 10; ++i) {
        items.push([1000+i, i, 0]);
    }
    var obj = {
        p : DEFINE.PROTO.USER_SYNC_ITEM,
        s : 0,
        m : {
            uid : uid,
            item : items
        }
    };

    request.post(url, {
        form : {
            b : JSON.stringify(obj)
        }
    }, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var ret = JSON.parse(body);
            cb(err, ret.r);
        } else {
            console.log(err);
        }
    });
}

model.userSyncCopy = function(uid, cb) {
    var copys = [];
    for (var i = 0; i < 10; ++i) {
        copys.push([1000+i, i, 0]);
    }
    var obj = {
        p : DEFINE.PROTO.USER_SYNC_COPY,
        s : 0,
        m : {
            uid : uid,
            copy : copys
        }
    };

    request.post(url, {
        form : {
            b : JSON.stringify(obj)
        }
    }, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var ret = JSON.parse(body);
            cb(err, ret.r);
        } else {
            console.log(err);
        }
    });
}

model.userSyncPet = function(uid, cb) {
    var obj = {
        p : DEFINE.PROTO.USER_SYNC_PET,
        s : 0,
        m : {
            uid : uid,
            pet : {
                petid : [1001, 1002],
                pet_equip : 1001,
                pet_suit : [1003, 1004, 1005]
            }
        }
    };

    request.post(url, {
        form : {
            b : JSON.stringify(obj)
        }
    }, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var ret = JSON.parse(body);
            cb(err, ret.r);
        } else {
            console.log(err);
        }
    });
}