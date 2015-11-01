/**
 * Created by bin.hou on 2015/10/21.
 */

var async = require('async');
var cacheManger = require('./../manager/cacheManager.js');
var logger = require("./../../utils/log.js");
var uidDao = require('./../dao/uidDao.js');
var CODE = require('./../../utils/code.js');

var user = module.exports;

/* @brief 每次发现池里小于500个，则生成5000个账号账号
 */
user.genUid = function(app, cb) {
    async.waterfall([
        function(callback) {
            cacheManger.getUidCount(function(err, data) {
                callback(err, data);
            });
        },
        function(data, callback) {
            if (data < 500 ) {
                user.addUidToCache(function(err) {
                    cacheManger.randUid(function(err, data) {
                        callback(err, data);
                    });
                });
            } else {
                cacheManager.randUid(function(err, data) {
                    callback(err, data);
                });
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
        if (results[0] !== null) start = results[0] + 1;
        var end = start + 5000 - 1;

        async.whilst(
            function() {return start < end;},
            function(callback) {
                async.parallel([
                    function(cb1) {
                        uidDao.insertOrUpdateUidFlag(app, start, 0, function(err, res) {
                            cb1(err, res);
                        });
                    },
                    function(cb1) {
                        cacheManger.addUid(start, function(err, res) {
                            cb1(err, res);
                        });
                    },
                ], function(err, results) {
                    callback(err, results);
                });
            },
            function(err) {
                cb(err);
            }
        );
    });
}


user.delUidFromCache = function(app, uid) {
    async.parallel([
        function(callback) {
            cacheManger.delUid(uid, callback);
        },
        function(callback) {
            uidDao.insertOrUpdateUidFlag(app, uid, 1, callback);
        }
    ], function(err, results) {
        cb(err, results);
    });
}
