/**
 * @brief 协议处理
 * Created by houbin on 15-10-18.
 */
var protoHanlder = module.exports;
var protoHandlers = {};

var user_controller = require('./../service/controller/user_controller.js');

/* @brief init proto
 */
protoHanlder.init = function(app) {
    protoHandlers[] = user_controller.login;
    protoHandlers[] = user_controller.logout;
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