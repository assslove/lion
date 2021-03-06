/**
 * @brief 子进程 worker.js
 * Created by bin.hou on 2015/12/31.
 */

var async = require('async');
var later = require('later');

var model = require('./model.js');
var util = require('util');
var MysqlCli = require('./mysqlCli.js');
var DEFINE = require('./proto/define.js')

var mysqlCli = MysqlCli({
    host : '127.0.0.1',
    port : 3306,
    user : 'root',
    password : '8459328',
    db : 'performance'
});

var totalUid = 50;
var interval = 10;
var totalSync = 50;

var uids = [];

function syncAllUsersInfo(callback)
{
    var i = 0;
    var start = new Date().getTime();
    async.whilst(
        function() {return i < totalUid;},
        function(cb) {
            synAllUserInfo(uids[i], function(err, res) {
                ++i;
                cb(err);
            });
        },
        function(err) {
            var end = new Date().getTime();
            console.log("sync user info total time :" + (end-start) + " pid: " + process.pid);
            callback();
        }
    );
}

async.series([
    function(callback) {
        userCreate(function() {
            callback(null, 0);
        });
    },
    function(callback) {
        userLogin(function() {
            callback(null, 1);
        });
    },
    function(callback) {
        var cron = later.parse.cron('0/'+interval+' * * * * *', true);
        var t = later.setInterval(function() {
            syncAllUsersInfo(function() {
                totalSync -= 1;
                if (totalSync == 0)  {
                    t.clear();
                    callback(null, 3);
                }
            });
        }, cron);
    }
], function(err, results) {
    console.log('all performance test success :' + process.pid);
    process.exit();
   // mysqlCli.destroy(function() {});
});

function addLog(p, t) {
    mysqlCli.query("insert into t_log values(?, ?)", [p, t], function(err, results) {
        ;
    });
}

function userCreate (cb) {
    var i = 0;
    async.whilst(
        function() {return i < totalUid;},
        function(callback) {
            var start = new Date().getTime();
            model.userCreate("test_" + i, function(err, result) {
                uids.push(result);
                var end = new Date().getTime();
                console.log(util.format("success create user : %d, %d", result, end - start));
                addLog(DEFINE.PROTO.USER_CREATE, end-start);
                ++i;
                callback(err);
            });
        },
        function(err) {
            console.log("success create users");
            cb();
        }
    );
}


function userLogin(cb) {
    var i = 0;
    async.whilst(
        function() {return i < totalUid;},
        function(callback) {
            var start = new Date().getTime();
            model.userLogin(uids[i], function(err, result) {
                if (result != 0) console.log("user login err : " + result);
                var end = new Date().getTime();
                console.log(util.format("success  user login: %d, %d", uids[i], end - start));
                addLog(DEFINE.PROTO.USER_LOGIN, end-start);
                ++i;
                callback(err);
            });
        },
        function(err) {
            console.log("success all user login");
            cb();
        }
    );
}

function synAllUserInfo(uid, cb) {
    async.series([
        function(callback) {
            var start = new Date().getTime();
            model.userSyncInfo(uid, function(err, res) {
                var end = new Date().getTime();
                addLog(DEFINE.PROTO.USER_SYNC_INFO, end - start);
                callback(err, res);
            });
        },
        function(callback) {
            var start = new Date().getTime();
            model.userSyncItem(uid, function(err, res) {
                var end = new Date().getTime();
                addLog(DEFINE.PROTO.USER_SYNC_ITEM, end - start);
                callback(err, res);
            });
        }, function(callback) {
            var start = new Date().getTime();
            model.userSyncCopy(uid, function(err, res) {
                var end = new Date().getTime();
                addLog(DEFINE.PROTO.USER_SYNC_COPY, end - start);
                callback(err, res);
            });
        }, function(callback) {
            var start = new Date().getTime();
            model.userSyncPet(uid, function(err, res) {
                var end = new Date().getTime();
                addLog(DEFINE.PROTO.USER_SYNC_PET, end - start);
                callback(err, res);
            });
        },
    ], function(err, results) {
        for (var i in results) {
            if (results[i] != 0) console.log('sync user info failed : ' + uid);
        }
        cb(err);
    });
}

