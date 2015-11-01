/**
 * Created by houbin on 15-10-18.
 */

var ProtoBuf = require("protobufjs");
var builder = ProtoBuf.loadProtoFile("./../../proto/user.proto");
var DEFINE = require('./../../proto/define.js');
var logger = require("./../../utils/log.js");
var cacheManager = require("./../manager/cacheManager.js");
var CODE = require("./../../utils/code.js");
var utils = require('./../../utils/utils.js');
var protoManager = require('./../manager/protoManager.js');
var userDao = require('./../dao/userDao.js');
var user = require('./../model/user.js');

var userController = module.exports;

userController.userLogin = function(protoid, pkg, req, res, cb) {
    req.session.uid = pkg.uid;
    req.session.cookie.expires = false;
    req.session.save();

    logger.info("%d user login", pkg.uid);
}

userController.userLogout = function(protoid, pkg, req, res, cb) {
    if (req.session) {
        req.session.destroy(function() {

        });
    }

    logger.info("%d user logout", pkg.uid);
}

userController.userCreate = function(protoid, pkg, req, res, cb) {
    if (pkg.uid > CODE.MIN_UID) {
        logger.error("user create uid is error [uid=%d]", pkg.uid);
        return cb(DEFINE.ERROR_CODE.PROTO_DATA_INVALID);
    }

    var isBindValid = false;
    for (var i in DEFINE.BIND_TYPE) {
        if (DEFINE.BIND_TYPE[i] === pkg.type) {
            isBindValid = true;
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

    user.getUid(function(uid) {
        var user = {
            uid : uid,
            name : pkg.name,
            head_icon : 0,
            max_copy : 0,
            cash : 0,
            gold : 0,
            hp : 0,
            last_login : 0,
            req_time : utils.getCurTime()
        };

        switch (pkg.type) {
            case DEFINE.BIND_TYPE.BIND_QQ:
                user.qq = pkg.bind_id;
                break;
            case DEFINE.BIND_TYPE.BIND_WECHAT:
                user.wechat = pkg.bind_id;
                break;
        }

        userDao.addUser(req.app, user, function(err, results) {
            if (err !== null) return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.USER_EXIST);
            var jsonObj = {
                uid : uid
            };

            logger.info("%d user create success", uid);
            protoManager.sendMsgToUser(res, protoid, jsonObj);
        });
    });
}

