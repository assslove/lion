/**
 * @brief 协议处理
 * Created by houbin on 15-10-18.
 */
var fs = require('fs');
var Schema = require('node-protobuf');
var codePb = new Schema(fs.readFileSync('./../proto/desc/code.desc'));

var protoHanlder = module.exports;

var protoHandlers = {};

var userController = require('./controller/userController.js');

/* @brief init proto
 */
protoHanlder.init = function(app) {
    protoHandlers[codePb.info("USER_LOGIN")] = userController.login;
    protoHandlers[codePb.USER_LOGOUT] = userController.logout;
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