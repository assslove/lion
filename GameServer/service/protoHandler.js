/**
 * @brief 协议处理
 * Created by houbin on 15-10-18.
 */
var path = require("path");
var ProtoBuf = require("protobufjs");
var DEFINE = require('./../proto/define.js');
var logger = require('./../utils/log.js');
var bufferpack = require('bufferpack');

var userController = require('./controller/userController.js');

module.exports = function(app) {
    return new ProtoHandler(app);
}


function ProtoHandler(app) {
    this.app = app;
    this.protoFile = path.join(__dirname, "../proto/user.proto");
    this.protoHandlers = {};
    this.builder = ProtoBuf.loadProtoFile(this.protoFile);
    this.rootMsg = builder.build("game");
}


/* @brief init proto
 */
ProtoHandler.init = function(app) {
    this.protoHandlers[DEFINE.PROTO.USER_LOGIN] =  [userController.userLogin, "UserLoginReq"];
    this.protoHandlers[DEFINE.PROTO.USER_LOGOUT] = [userController.userLogout, "UserLogoutReq"];
    this.protoHandlers[DEFINE.PROTO.USER_CREATE] = [userController.userCreate, "UserCreateReq"];

    app.get('logger').info("init proto handlers success");
}


/* @param req 请求包
 * @param res 返回
 * @cb 回调函数
 */
ProtoHandler.handle = function(protoid, msg, req, res, cb) {
    if (this.protoHandlers[protoid] == null || this.protoHandlers[protoid] == undefined) {
        cb(DEFINE.ERROR_CODE.PROTO_NOT_FOUND[0]);
        return ;
    }
    try {
        var builder = ProtoBuf.loadProtoFile(this.protoFile);
        var Game = builder.build("game");
        var Msg = Game[this.protoHandlers[protoid][1]];
        var pkg = Msg.decode(msg);

//        if (req.ses("sion == null || req.session.uid != pkg.uid) { //检测session是否过期
//            cb(DEFINE.ERROR_CODE.USER_SESSION_EXPIRE);
//            return ;
//        }

        this.protoHandlers[protoid][0](pkg, req, res, cb);
    } catch (e) {
        logger.error("proto error %s", e);
        cb(DEFINE.ERROR_CODE.PROTO_NOT_FOUND[0]);
    }
}

ProtoHandler.sendErrorToUser = function(res, proto_id, err) {
    var head = bufferpack.pack("<IHH", [8, proto_id, err]);
    res.send(head);
}

ProtoHandler.getProtoBuilder = function() {
    return this.builder;
}

ProtoHandler.getRootMsg = function() {
    return this.rootMsg;
}