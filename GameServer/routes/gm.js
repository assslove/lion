/**
 * @brief GM命令 用于对服务器进行一些操作
 * Created by bin.hou on 2015/10/29.
 */

var express = require('express');
var async = require('async');

var router = express.Router();

var uidDao = require('../service/dao/uidDao.js');
var cacheManager = require('../service/manager/cacheManager.js');
var CODE = require('../utils/code.js');
var utils = require('../utils/utils.js');
var sysMailDao = require('../service/dao/sysMailDao.js');
var mailDao = require('../service/dao/mailDao.js');
var sysMailLogDao = require('../service/dao/sysMailLogDao.js');

router.get('/gen_uid', function(req, res, next) {
    var count = req.query.count;

    uidDao.getMaxUid(req.app, function(err, results) {
        if (err !== null) return res.send(err.message);

        var start = 0;
        if (results.length != 0 && results[0] != null)  start = parseInt(results[0].uid) + 1;
        else start = CODE.MIN_UID + 1;
        var end = start + parseInt(count);
        async.whilst(
            function() { return start < end;},
            function(callback) {
                async.parallel([
                        function(cb) {
                            uidDao.insertOrUpdateUidFlag(req.app, start, 0, function(err, res) {
                                cb(err, res);
                            });
                        },
                        function(cb){
                            cacheManager.addUid(start, function(err, res) {
                                cb(err, res);
                            })
                        }
                    ], function(err, results) {
                        ++start;
                        callback(err);
                    }
                )
            },
            function(err) {
                if (err === null || err === undefined) {
                    res.send(utils.getRetMsg(0, "init uid success!"));
                } else {
                    res.send(utils.getRetMsg(1, "init uid failed!"));
                }
            }
        );
    });
});

router.post('/sysmail/add', function(req, res, next) {
    var data = JSON.parse(req.body.json);
    var uid = data.uid.split(',');
    var id = utils.getCurTime();
    var obj = {
        title : data.title,
        content : data.content
    };

    obj.expire = id + 3600 * 24 * data.expire;

    if (uid.length == 1 && uid[0] == 0) { //系统邮件
        obj.item = cacheManager.serializeToPb("ItemList", {item : data.item});
        async.series([
            function(cb) {
                sysMailDao.addOrUpdateSysMail(req.app, id, obj, cb);
            },
            function(cb) {
                obj.id = id;
                obj.uid = 0;
                sysMailLogDao.addOrUpdateSysMailLog(req.app, obj, cb);
            }
        ], function(err, results) {
            if (err == null) res.send("发送系统邮件成功");
            else res.send("发送系统邮件失败");
        });
    } else { //指定用户邮件
        var i = 0, total = uid.length;
        async.whilst(
            function() {return i < total},
            function(callback) {
                mailDao.getMail(req.app, uid[i], function(err, results) {
                    if (err != null) {
                        ++i;
                        return callback(err);
                    }
                    var mails = cacheManager.parseFromPb("SysMailList", results[0].info).mail;
                    obj.item = data.item;
                    obj.id = id;
                    mails.push(obj);

                    var buffer = cacheManager.serializeToPb("SysMailList", {mail : mails});
                    async.series([
                        function(cb) {
                            mailDao.addOrUpdateMail(req.app, uid[i], {info : buffer}, cb);
                        },
                        function(cb) {
                            var sysMailLog = utils.clone(obj);
                            sysMailLog.uid = uid[i];
                            sysMailLog.item = cacheManager.serializeToPb("ItemList", {item : obj.item});
                            sysMailLogDao.addOrUpdateSysMailLog(req.app, sysMailLog, cb);
                        }
                    ], function(err, results) {
                        ++i;
                        callback(err);
                    });
                });
            },
            function(err) {
                if (err != null) res.send("发送邮件失败");
                else res.send("发送邮件成功");
            }
        );
    }
});

router.get('/sysmaillog/list', function(req, res, next) {
    sysMailLogDao.getSysMailLogByCond(req.app, req.query, function(err, data) {
        res.send(data);
    });
});

router.get('/sysmaillog/one', function(req, res, next) {
    sysMailLogDao.getOneSysMailLog(req.app, req.query.id, req.query.uid, function(err, results) {
        results[0].item = cacheManager.parseFromPb("ItemList", results[0].item).item;
        res.send(results[0]);
    });
});

module.exports = router;