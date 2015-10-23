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
    this.rootMsg = this.builder.build("game");
}


/* @brief init proto
 */
ProtoHandler.prototype.init = function() {
    this.protoHandlers[DEFINE.PROTO.USER_LOGIN] =  [userController.userLogin, "UserLoginReq", "UserLoginRet"];
    this.protoHandlers[DEFINE.PROTO.USER_LOGOUT] = [userController.userLogout, "UserLogoutReq"];
    this.protoHandlers[DEFINE.PROTO.USER_CREATE] = [userController.userCreate, "UserCreateReq", "UserCreateRet"];

    logger.info("init proto handlers success");
}


/* @param req 请求包
 * @param res 返回
 * @cb 回调函数
 */
ProtoHandler.prototype.handle = function(protoid, msg, req, res, cb) {
    if (this.protoHandlers[protoid] == null || this.protoHandlers[protoid] == undefined) {
        cb(DEFINE.ERROR_CODE.PROTO_NOT_FOUND[0]);
        return ;
    }
    try {
        var Msg = this.rootMsg[this.protoHandlers[protoid][1]];
        var pkg = Msg.decode(msg);

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
    var head = bufferpack.pack("<IHH", [8, proto_id, err]);
    res.send(head);
}

ProtoHandler.prototype.getProtoBuilder = function() {
    return this.builder;
}

ProtoHandler.prototype.getRootMsg = function() {
    return this.rootMsg;
}

ProtoHandler.prototype.sendMsgToUser = function(res, protoid, msg) {
    if (msg == null) {
        this.sendErrorToUser(res, protoid, 0);
        return ;
    }
    var buffer = msg.encode().toBuffer();
    var len = buffer.length + 8;
    var head = bufferpack.pack("<IHH", [len, protoid, 0]);
    var buffers = Buffer.concat([head, buffer], len);
    res.send(buffers);
}

ProtoHandler.prototype.getResponseMsg = function(proto_id) {
    var str = this.protoHandlers[proto_id][2];
    if (str == null || str == undefined) {
        return null;
    }

    return this.rootMsg[str];
}