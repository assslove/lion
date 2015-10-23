/**
 * Created by houbin on 15-10-18.
 */

var ProtoBuf = require("protobufjs");
var builder = ProtoBuf.loadProtoFile("./../../proto/user.proto");
var DEFINE = require('./../../proto/define.js');
var logger = require("./../../utils/log.js");

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
    var handle = req.app.get("proto_handler");
    logger.info("%d user create", pkg.uid);
    var Msg = handle.getResponseMsg(protoid);
    if (Msg == null) {
        handle.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.MSG_NOT_FOUND);
        return ;
    }

    var jsonObj = {
        uid : pkg.uid,
        qq : 0,
        wechat : pkg.bind_id
    };
    var msg = new Msg(jsonObj);
    handle.sendMsgToUser(res, protoid, msg);
}