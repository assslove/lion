/**
 * @brief 协议处理
 * Created by houbin on 15-10-18.
 */
var DEFINE = require("./../proto/define.js");

var protoHandler = module.exports;

var protoHandlers = {};

var userController = require('./controller/userController.js');

/* @brief init proto
 */
protoHandler.init = function(app) {
    protoHandlers[DEFINE.PROTO.USER_LOGIN] = userController.login;
    protoHandlers[DEFINE.PROTO.USER_LOGOUT] = userController.logout;

    app.get('logger').info("init proto handlers success");
}


/* @param req 请求包
 * @param res 返回
 * @cb 回调函数
 */
protoHandler.handle = function(req, res, cb) {
    if (protoHandlers[req.body.protoid] == null) {
        cb();
    }

    protoHandlers[req.body.protoid](req, res, cb);
}