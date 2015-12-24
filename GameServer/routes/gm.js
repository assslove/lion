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

router.get('/gen_uid', function(req, res, next) {
    var count = req.query.count;

    uidDao.getMaxUid(req.app, function(err, results) {
        if (err !== null) return res.send(err.message);

        var start = 0;
        if (results.length != 0 && results[0] != null)  start = results[0] + 1;
        else start = CODE.MIN_UID + 1;
        var end = start + count;
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
                            cacheManager.addUid(req.app, start, function(err, res) {
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
    var id = utils.getCurTime();
    var obj = {
        title : data.title,
        content : data.content
    };

    obj.expire = id + 3600 * 24 * data.expire;
    obj.item = cacheManager.serializeToPb("ItemList", {item : data.item});

    sysMailDao.addOrUpdateSysMail(req.app, obj.id, obj, function(err, results) {
        if (err == null) res.send("发送系统邮件成功");
        else res.send("发送系统邮件失败");
    });
});

module.exports = router;