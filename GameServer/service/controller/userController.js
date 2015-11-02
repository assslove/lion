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
    userDao.getUser(req.app, pkg.uid, function(err, results) {
        if (err != null || results.length == 0) {
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
    async.parallel([
        function(callback) {
            cacheManager.getUser(req.app, pkg.uid, callback);
        },
        function(callback) {
            cacheManager.getItem(req.app, pkg.uid, callback);
        },
        function(callback) {
            cacheManager.getCopy(req.app, pkg.uid, callback);
        }
    ], function(err, results) {
        if (err != null)  {
            return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.USER_DATA_ERROR);
        }

        var obj = {
            user : results[0].length > 0 ? results[0][0] : null,
            item : results[1] == null ? [] : results[1],
            copy : results[2] == null ? [] : results[2]
        };

        protoManager.sendMsgToUser(res, protoid, obj);
    });
}
