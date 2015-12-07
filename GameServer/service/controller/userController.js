/**
 * Created by houbin on 15-10-18.
 */
var async = require('async');

var DEFINE = require('./../../proto/define.js');
var logger = require("./../../utils/log.js");
var cacheManager = require("./../manager/cacheManager.js");
var CODE = require("./../../utils/code.js");
var utils = require('./../../utils/utils.js');
var protoManager = require('./../manager/protoManager.js');
var userDao = require('./../dao/userDao.js');
var accountDao = require('./../dao/accountDao.js');
var userModel = require('./../model/user.js');
var async = require('async');

var userController = module.exports;

/* @brief 用户登录
 */
userController.userLogin = function(protoid, pkg, req, res, cb) {
    userModel.getUserInfo(req.app, pkg.uid, function(err, results) {
        if (err != null || results == null) {
            protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.USER_NOT_EXIST[0]);
        } else {
            req.session.uid = pkg.uid;
            req.session.cookie.expires = false;
            req.session.save();

            logger.info("%d user login", pkg.uid);

            if (utils.isDiffDay(results.user.last_login)) {
                userModel.initData(req.app, pkg.uid);
            }

            //标记登录时间
            var user = results.user;
            user.last_login = utils.getCurTime();

            userModel.updateUser(req.app, user, function(err, results) {
                protoManager.sendErrorToUser(res, protoid, 0);
            });
        }
    });
}

/* @brief 用户登出
 */
userController.userLogout = function(protoid, pkg, req, res, cb) {
    if (req.session) {
        req.session.destroy(function() {
            logger.info("%d user logout", pkg.uid);
            protoManager.sendErrorToUser(res, protoid, 0);
        });
    }
}

/* @brief 用户创建
 */
userController.userCreate = function(protoid, pkg, req, res, cb) {
    if (pkg.uid > CODE.MIN_UID) {
        logger.error("user create uid is error [uid=%d]", pkg.uid);
        return cb(DEFINE.ERROR_CODE.PROTO_DATA_INVALID[0]);
    }

    userModel.genUid(req.app, function(uid) {
        var user = {
            uid : uid,
            name : req.name,
            head_icon : 0,
            max_copy : 0,
            copy_stars : 0,
            cash : 0,
            gold : 0,
            hp : 0,
            last_login : 0,
            reg_time : utils.getCurTime()
        };

        var account = {
            uid : uid,
        };

        async.parallel([
            function(callback) {
                accountDao.addOrUpdateAccount(req.app, account, callback);
            },
            function(callback) {
                userDao.addUser(req.app, user, callback);
            },
            function(callback) {
                userModel.delUidFromCache(req.app, uid, callback);
            },
            function(callback) {
                userModel.addFriendMail(req.app, uid, callback);
            },
            function(callback) {
                userModel.addFriend(req.app, uid, callback);
            },
            function(callback) {
                userModel.addPetParty(req.app, uid, callback);
            },
            function(callback) {
                cacheManager.updateUserBase(uid, user, callback);
            }
        ], function(err, results) {
            if (err != null) return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.USER_EXIST[0]);

            var jsonObj = {
                uid : uid
            };

            logger.info("%d user create success", uid);
            protoManager.sendMsgToUser(res, protoid, jsonObj);
        });
    });
}


userController.userGetInfo = function(protoid, pkg, req, res, cb) {
    userModel.getUserInfo(req.app, pkg.uid, function(err, results) {
        if (err != null || err != undefined)  {
            return cb(DEFINE.ERROR_CODE.USER_DATA_ERROR[0]);
        }

        var obj = {
            user : results.user,
            item : results.item,
            copy : results.copy
        };

        protoManager.sendMsgToUser(res, protoid, obj);
    });
}

userController.userSyncInfo = function(protoid, pkg, req, res, cb) {
    cacheManager.getUser(req.app, pkg.uid, function(err, result) {
        if (err == null || res != null) {
            //TODO check user info
            var user = result;
            for (var i in pkg) {
                user[i] = pkg[i];
            }

            async.parallel([
                function(callback) {
                    cacheManager.updateUser(pkg.uid, user, callback);
                },
                function(callback) {
                    userDao.updateUser(req.app, user, callback);
                },
                function(callback) {
                    cacheManager.updateUserBase(pkg.uid, user, callback);
                }
            ], function(err, results) {
                if (err != null || err != undefined) cb(DEFINE.ERROR_CODE.USER_SAVE_ERROR[0]);
                protoManager.sendMsgToUser(res, protoid, user);
            });
        } else {
            cb(DEFINE.ERROR_CODE.USER_NOT_EXIST[0]);
        }
    });
}

userController.userSyncTime = function(protoid, pkg, req, res, cb) {
    var obj = {
        timestamp : utils.getCurTime()
    };

    protoManager.sendMsgToUser(res, protoid, obj);
}

userController.getOtherUser = function(protoid, pkg, req, res, cb) {
    var uids = [pkg.other];
    cacheManager.getUserBases(uids, function(err, results) {
        if (results.length == 0)
            return cb(DEFINE.ERROR_CODE.USER_NOT_EXIST[0]);

        protoManager.sendMsgToUser(res, protoid, results[0]);
    });

//    cacheManager.getUserBases(req.app, pkg.other, function(err, result) {
//        if (err != null) {
//            return cb(DEFINE.ERROR_CODE.USER_NOT_EXIST[0]);
//        }
//
//        protoManager.sendMsgToUser(res, protoid, result);
//    });
}

userController.getCopyRank = function(protoid, pkg, req, res, cb) {
    var copyid = pkg.copyid;
    var ids = pkg.friendid;
    cacheManager.getUserCopyScore(copyid, ids, function(err, results) {
        var copys = [];
        for (var i in ids) {
            var copy = [ids[i], parseInt(results[i])];
            copys.push(copy);
        }

        copys.sort(function(a, b) {
           return a[1] < b[1];
        });

        var rank = 0;
        for (var i in copys) {
            if (copys[i][0] == pkg.uid) {
                rank = parseInt(i) + 1;
                break;
            }
        }

        copys.slice(0, 10);

        var ret = {
            rank : rank,
            friend : copys
        };
        protoManager.sendMsgToUser(res, protoid, ret);
    });
}
