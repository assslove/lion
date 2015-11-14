/**
 * Created by bin.hou on 2015/10/21.
 */

var async = require('async');
var cacheManager = require('./../manager/cacheManager.js');
var logger = require("./../../utils/log.js");
var uidDao = require('./../dao/uidDao.js');
var CODE = require('./../../utils/code.js');
var userDao = require('../dao/userDao.js');
var itemDao = require('../dao/itemDao.js');
var copyDao = require('../dao/copyDao.js');
var friendMailDao = require('./../dao/friendMailDao.js');
var utils = require("./../../utils/utils.js");


var user = module.exports;

/* @brief 每次发现池里小于500个，则生成5000个账号账号
 */
user.genUid = function(app, cb) {
    async.waterfall([
        function(callback) {
            cacheManager.getUidCount(callback);
        },
        function(data, callback) {
            if (data < 500 ) {
                user.addUidToCache(app, function(err) {
                    cacheManager.randUid(callback);
                });
            } else {
                cacheManager.randUid(callback);
            }
        }
    ], function(err, results) {
        if (err != null) {
            logger.error("genenrate uid falied");
            cb(0);
        } else {
            cb(results);
        }
    });
}

/* @brief 增加5000个号到池里 并
 */
user.addUidToCache = function(app, cb) {
    uidDao.getMaxUid(app, function(err, results) {
        var start = CODE.MIN_UID + 1;
        if (results[0].uid != null) start = results[0].uid + 1;
        var end = start + 5000;

        var before_cb = cb;
        async.whilst(
            function() {return start < end;},
            function(callback) {
                async.parallel([
                    function(cb1) {
                        uidDao.insertOrUpdateUidFlag(app, start, 0, cb1);
                    },
                    function(cb1) {
                        cacheManager.addUid(start, cb1);
                    },
                ], function(err, results) {
                    ++start;
                    callback(err, results);
                });
            },
            function(err) {
                before_cb(err);
            }
        );
    });
}


user.delUidFromCache = function(app, uid, cb) {
    async.parallel([
        function(callback) {
            cacheManager.delUid(uid, callback);
        },
        function(callback) {
            uidDao.insertOrUpdateUidFlag(app, uid, 1, callback);
        }
    ], function(err, results) {
        cb(err, results);
    });
}

user.getUserInfo = function(app, uid, cb) {
    cacheManager.getUserInfo(app, uid, function(err, res) {
        if (err == null && res == null) {
            user.getUserInfoFromDB(app, uid, function(err, res) {
                if (err != null) {
                    utils.callback(cb, err, res);
                } else {
                    cacheManager.updateUserInfo(app, uid, res, function(err, result) {
                        cb(err, res);
                    });
                }
            });
        } else {
            var results = {
                user : res[CODE.CACHE_KEY_TYPE.USER],
                item : res[CODE.CACHE_KEY_TYPE.ITEM],
                copy : res[CODE.CACHE_KEY_TYPE.COPY]
            };
            cb(err, results);
        }
    })
}

user.getUserInfoFromDB = function(app, uid, cb) {
    async.series([
        function(callback) {
            userDao.getUser(app, uid, callback);
        },
        function(callback) {
            itemDao.getItem(app, uid, callback);
        },
        function(callback) {
            copyDao.getCopy(app, uid, callback);
        }
    ], function(err, results) {
        var items = [], copys = [];
        for (var i in results[1]) {
            var item = results[1][i];
            items.push([item.itemid, item.count, item.expire]);
        }

        for (var i in results[2]) {
            var copy = results[2][i];
            copys.push(copy.copyid, copy.star, copy.score);
        }
        cb(err, {
            "user" : results[0] != null && results[0].length != 0 ? results[0][0]  : null,
            "item" : items,
            "copy" : copys
        });
    });
}



user.addFriendMail(app, uid, cb) {
    friendMailDao.addOrUpdateFriendMail(app, uid, function(err, results) {

    });
}
