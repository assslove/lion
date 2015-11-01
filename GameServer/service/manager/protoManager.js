/**
 * protoHandler 管理类
 * Created by houbin on 15-10-31.
 */

var g_handler = null;

var protoManager = module.exports;

protoManager.init = function(handler) {
    g_handler = handler;
    g_handler.init();
}

protoManager.sendMsgToUser = function(res, protoid, msg) {
    g_handler.sendMsgToUser(res, protoid, msg);
}

protoManager.sendErrorToUser = function(res, protoid, code) {
    g_handler.sendErrorToUser(res, protoid, code);
}
