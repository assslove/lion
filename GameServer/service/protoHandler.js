/**
 * @brief 协议处理
 * Created by houbin on 15-10-18.
 */

var ProtoBuf = require("protobufjs");
var DEFINE = require('./../proto/define.js');
var logger = require('./../utils/log.js');

var protoHandler = module.exports;

var protoHandlers = {};

var userController = require('./controller/userController.js');

/* @brief init proto
 */
protoHandler.init = function(app) {
    protoHandlers[DEFINE.PROTO.USER_LOGIN] =  [userController.userLogin, "UserCreateReq"];
    protoHandlers[DEFINE.PROTO.USER_LOGOUT] = [userController.userLogout, "UserLogoutReq"];
    protoHandlers[DEFINE.PROTO.USER_CREATE] = [userController.userCreate, "UserCreateReq"];

    app.get('logger').info("init proto handlers success");
}


/* @param req 请求包
 * @param res 返回
 * @cb 回调函数
 */
protoHandler.handle = function(protoid, msg, req, res, cb) {
    if (protoHandlers[protoid] == null || protoHandlers[protoid] == undefined) {
        cb(DEFINE.ERROR_CODE.PROTO_NOT_FOUND);
        return ;
    }

    try {
        var builder = ProtoBuf.loadProtoFile("./../proto/user.proto");
        var Game = builder.build("game");
        var Msg = Game[protoHandler[protoid][1]];
        var pkg = Msg.decode(msg);

//        if (req.session == null || req.session.uid != pkg.uid) { //检测session是否过期
//            cb(DEFINE.ERROR_CODE.USER_SESSION_EXPIRE);
//            return ;
//        }

        protoHandlers[protoid][0](pkg, req, res, cb);
    } catch (e) {
        logger.error("proto error %s", e);
        cb(DEFINE.ERROR_CODE.PROTO_NOT_FOUND);
    }
}