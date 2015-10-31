/**
 * Created by houbin on 15-10-18.
 */

var ProtoBuf = require("protobufjs");
var builder = ProtoBuf.loadProtoFile("./../../proto/user.proto");
var DEFINE = require('./../../proto/define.js');
var logger = require("./../../utils/log.js");
var cacheManager = require("./../service/cacheManager.js");
var CODE = require("./../utils/code.js");
var utils = require('./../utils/utils.js');
var protoManager = require('./../manager/protoManager.js');
var userDao = require('./../dao/userDao.js');

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

    cacheManager.getUid(function(uid) {
        var user = {
            uid : pkg.uid,
            name : pkg.name
        };

        userDao.addUser(req.app, user, function(err, result) {
            logger.info("%d user create success", pkg.uid);
            protoManager.sendMsgToUser(res, protoid, jsonObj);
        });
    });
}

