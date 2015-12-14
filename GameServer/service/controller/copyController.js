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
            copyMap[results[i][0]] = [results[i][1], results[i][2]];
        }

        for (var i in copys) {
			if (copys[i][1] == null)  continue;
            copyMap[copys[i][0]] = [copys[i][1], copys[i][2]];
        }

        var allCopys = [];
        for (var i in copyMap) {
            allCopys.push([i, copyMap[i][0], copyMap[i][1]]);
        }

        //检验道具合法性 TODO
        async.parallel([
            function(callback) {
                cacheManager.updateCopyScore(pkg.uid, copys, callback);
            },
            function(callback) {
                cacheManager.updateCopy(pkg.uid, allCopys, callback);
            },
            function(callback){
                var i = 0, total = copys.length;
                async.whilst(
                    function() {return i < total;},
                    function(callback1) {
                        var saveCopy = {
                            copyid : copys[i][0],
                            max_score : copys[i][1],
                            star : copys[i][2]
                        };
                        copyDao.addOrUpdateCopy(req.app, pkg.uid, saveCopy, function(err, res) {
                            ++i;
                            callback1(err, res);
                        });
                    },
                    function(err) {
                        callback(err, null);
                    }
                )
            }
        ], function(err, results) {
            if (err == null || err == undefined) {
                protoManager.sendMsgToUser(res, protoid, allCopys);
            } else {
                cb(DEFINE.ERROR_CODE.COPY_SAVE_ERROR[0]);
            }
        });
    });
}

