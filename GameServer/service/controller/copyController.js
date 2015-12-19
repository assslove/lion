/**
 * Created by houbin on 15-11-1.
 */

var async = require('async');

var DEFINE = require('./../../proto/define.js');
var logger = require("./../../utils/log.js");
var cacheManager = require("./../manager/cacheManager.js");
var CODE = require("./../../utils/code.js");
var utils = require('./../../utils/utils.js');
var protoManager = require('./../manager/protoManager.js');
var copyDao = require('./../dao/copyDao.js');
var userModel = require('./../model/user.js');

var copyController = module.exports;

copyController.userSyncCopy = function(protoid, pkg, req, res, cb) {
    var copys = pkg.copy;
    //校验关卡的正确性 TODO
    cacheManager.getCopy(req.app, pkg.uid, function(err, results) {
        var copyMap = {};
        for (var i in results) {
            copyMap[results[i].copyid] = [results[i].max_score, results[i].star];
        }

        for (var i = 0; i < copys.length;) {
			if (copys[i][1] == null || copys[i][2] == null)  {
                delete copys[i];
            } else {
                copyMap[copys[i][0]] = [copys[i][1], copys[i][2]];
                ++i;
            }
        }

        var allCopys = [];
        for (var i in copyMap) {
            allCopys.push({
                copyid: parseInt(i),
                max_score : copyMap[i][0],
                star : copyMap[i][1]
            });
        }

        //检验副本合法性 TODO
        var info = cacheManager.serializeToPb("CopyList", {copy: allCopys});
        async.parallel([
            function(callback) {
                cacheManager.updateCopyScore(pkg.uid, copys, callback);
            },
            function(callback) {
                cacheManager.updateCopy(pkg.uid, info, callback);
            },
            function(callback){
                copyDao.addOrUpdateCopy(req.app, pkg.uid, {info : info}, callback);
            }
        ], function(err, results) {
            if (err == null || err == undefined) {
                var copys = [];
                for (var i in allCopys) {
                    copys.push([allCopys[i].copyid, allCopys[i].max_score, allCopys[i].star]);
                }
                protoManager.sendMsgToUser(res, protoid, copys);
            } else {
                cb(DEFINE.ERROR_CODE.COPY_SAVE_ERROR[0]);
            }
        });
    });
}

