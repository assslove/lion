/**
 * @brief 协议处理
 * Created by houbin on 15-10-18.
 */
var path = require("path");
var DEFINE = require('./../proto/define.js');
var logger = require('./../utils/log.js');
var bufferpack = require('bufferpack');

var userController = require('./controller/userController.js');

module.exports = function(app) {
    return new ProtoHandler(app);
}

function ProtoHandler(app) {
    this.app = app;
    this.protoHandlers = {};
}


/* @brief init proto
 */
ProtoHandler.prototype.init = function() {
    this.protoHandlers[DEFINE.PROTO.USER_LOGIN] =  [userController.userLogin];
    this.protoHandlers[DEFINE.PROTO.USER_LOGOUT] = [userController.userLogout];
    this.protoHandlers[DEFINE.PROTO.USER_CREATE] = [userController.userCreate];

    logger.info("init proto handlers success");
}


/* @param req 请求包
 * @param res 返回
 * @cb 回调函数
 */
ProtoHandler.prototype.handle = function(protoid, pkg, req, res, cb) {
    if (this.protoHandlers[protoid] == null || this.protoHandlers[protoid] == undefined) {
        cb(DEFINE.ERROR_CODE.PROTO_NOT_FOUND[0]);
        return ;
    }
    try {
//        if (req.ses("sion == null || req.session.uid != pkg.uid) { //检测session是否过期
//            cb(DEFINE.ERROR_CODE.USER_SESSION_EXPIRE);
//            return ;
//        }

        this.protoHandlers[protoid][0](protoid, pkg, req, res, cb);
    } catch (e) {
        logger.error("proto error %s", e);
        cb(DEFINE.ERROR_CODE.PROTO_NOT_FOUND[0]);
    }
}

ProtoHandler.prototype.sendErrorToUser = function(res, proto_id, err) {
    var obj = {p : proto_id, r : err};
    res.send(JSON.stringify(obj));
}

ProtoHandler.prototype.sendMsgToUser = function(res, protoid, msg) {
    if (msg == null) {
        this.sendErrorToUser(res, protoid, 0);
        return ;
    }

    var obj = {p : protoid, r : 0, m : msg};
    res.send(JSON.stringify(obj));
}

