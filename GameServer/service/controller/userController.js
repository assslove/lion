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

var userController = module.exports;

/* @brief 用户登录
 */
userController.userLogin = function(protoid, pkg, req, res, cb) {
    userModel.getUserInfo(req.app, pkg.uid, function(err, results) {
        if (err != null || results == null) {
            protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.USER_NOT_EXIST);
        } else {
            req.session.uid = pkg.uid;
            req.session.cookie.expires = false;
            req.session.save();

            logger.info("%d user login", pkg.uid);

            protoManager.sendErrorToUser(res, protoid, 0);
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
        return cb(DEFINE.ERROR_CODE.PROTO_DATA_INVALID);
    }

    var isBindValid = false;
    for (var i in DEFINE.BIND_TYPE) {
        if (DEFINE.BIND_TYPE[i] == pkg.type) {
            isBindValid = true;
            break;
        }
    }

    if (!isBindValid) {
        logger.error("user create bind type error [type=%d]", pkg.type);
        return cb(DEFINE.ERROR_CODE.PROTO_DATA_INVALID);
    }

    if (utils.isNull(pkg.bind_id) || utils.isNull(pkg.name)) {
        logger.error("user create param error [bind_id=%s,name=%s]", pkg.bind_id, pkg.name);
        return cb(DEFINE.ERROR_CODE.PROTO_DATA_INVALID);
    }

    userModel.genUid(req.app, function(uid) {
        var user = {
            uid : uid,
            name : pkg.name,
            head_icon : 0,
            max_copy : 0,
            cash : 0,
            gold : 0,
            hp : 0,
            last_login : 0,
            reg_time : utils.getCurTime()
        };

        var account = {
            uid : uid,
        };

        switch (pkg.type) {
            case DEFINE.BIND_TYPE.BIND_QQ:
                account.qq = pkg.bind_id;
                break;
            case DEFINE.BIND_TYPE.BIND_WECHAT:
                account.wechat = pkg.bind_id;
                break;
        }

        async.parallel([
            function(callback) {
                accountDao.addOrUpdateAccount(req.app, account, callback);
            },
            function(callback) {
                userDao.addUser(req.app, user, callback);
            },
            function(callback) {
                userModel.delUidFromCache(req.app, uid, callback);
            }
        ], function(err, results) {
            if (err != null) return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.USER_EXIST);

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
            return cb(DEFINE.ERROR_CODE.USER_DATA_ERROR);
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
                }
            ], function(err, results) {
                if (err != null || err != undefined) cb(DEFINE.ERROR_CODE.USER_SAVE_ERROR);
                protoManager.sendMsgToUser(res, protoid, user);
            });
        } else {
            cb(DEFINE.ERROR_CODE.USER_NOT_EXIST);
        }
    });
}
