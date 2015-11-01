/**
 * Created by bin.hou on 2015/10/21.
 */

var async = require('async');
var cacheManager = require('./../manager/cacheManager.js');
var logger = require("./../../utils/log.js");
var uidDao = require('./../dao/uidDao.js');
var CODE = require('./../../utils/code.js');

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
