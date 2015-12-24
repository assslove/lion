/**
 * Created by bin.hou on 2015/12/24.
 */

var async = require('async');

var DEFINE = require('./../../proto/define.js');
var logger = require("./../../utils/log.js");
var cacheManager = require("./../manager/cacheManager.js");
var CODE = require("./../../utils/code.js");
var utils = require('./../../utils/utils.js');
var protoManager = require('./../manager/protoManager.js');
var mailDao = require('./../dao/mailDao.js');
var sysMailDao = require('./../dao/sysMailDao.js');

var mailController = module.exports;

mailController.getSysMail = function(protoid, pkg, req, res, cb) {
    mailDao.getMail(req.app, pkg.uid, function(err, data) {
        if (err != null) return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.DB_ERROR);

        var mail = data[0];
        var isUpdate = false;
        var cur = utils.getCurTime();

        var mails = [];
        if (data.length == 0) {
            isUpdate = true;
        } else {
            mails = cacheManager.parseFromPb("SysMailList", data[0].info).mail;
        }

        for (var i = 0; i < mails.length;) {
            if (cur > mails[i].expire) {
                isUpdate = true;
                mails[i].splice(i, 1);
            } else {
                ++i;
            }
        }
        async.waterfall([
            function(callback) {
                if (cur > mail.check_tm + 10) { //检查是否有系统邮件产生
                    isUpdate = true;
                    sysMailDao.getSysMail(req.app, mail.check_tm, cur, callback);
                } else {
                   callback(err, []);
                }
            },
            function(sysMails, callback) {
                for (var i in sysMails) {
                    sysMails[i].item = cacheManager.parseFromPb("ItemList", sysMails[i].item).item;
                    mails.push(sysMails[i]);
                }

                if (isUpdate) {
                    var buffer = cacheManager.serializeToPb("SysMailList", {mail : mails});
                    var obj = {
                        check_tm : cur,
                        info : buffer
                    };
                    mailDao.addOrUpdateMail(req.app, pkg.uid, obj, callback);
                }
            }
        ], function(err, results) {
            //发给前端
            for (var i in mails) {
                var tmp = [];
                for (var j in mails[i].item) {
                    tmp.push([mails[i].item[j].itemid, mails[i].item[j].count]);
                }
                mails[i].item = tmp;
            }
            protoManager.sendMsgToUser(res, protoid, {mail : mails});
        });
    });
}

mailController.readSysMail = function(protoid, pkg, req, res, cb) {
    mailDao.getMail(req.app, pkg.uid, function(err, results) {
        if (err != null) return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.DB_ERROR[0]);

        var mails = cacheManager.parseFromPb("SysMailList", results[0].info).mail;
        if (pkg.id == 0) {
            mails = [];
        } else {
            var isExist = false;
            for (var i in mails) {
                if (mails[i].id == pkg.id) {
                    mails.splice(i, 1);
                    isExist = true;
                    break;
                }
            }
            if (!isExist) return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.MAIL_NOT_FOUND[0]);
        }

        var buffer = cacheManager.serializeToPb("SysMailList", {mail : mails});
        mailDao.addOrUpdateMail(req.app, pkg.uid, {info : buffer}, function(err, results) {
            protoManager.sendErrorToUser(res, protoid, 0);
        });
    });
}