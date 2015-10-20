/**
 * @brief 日志定义
 * Created by bin.hou on 2015/10/20.
 */

var util = require('util');

var logger = module.exports;

var g_handle = null;
var g_app = null;

logger.init = function(app, handle) {
    g_app = app;
    g_handle = handle;
}

logger.error = function(fmt) {
    var arr = Array.prototype.slice.call(arguments);
    g_handle.error(util.format(fmt, arr.slice(1).join(',')));
}

logger.info = function(fmt) {
    var arr = Array.prototype.slice.call(arguments);
    g_handle.info(util.format(fmt, arr.slice(1).join(',')));
}

logger.debug = function(fmt) {
    var arr = Array.prototype.slice.call(arguments);
    g_handle.debug(util.format(fmt, arguments.slice(1).join(',')));
}

logger.stout = function(fmt) {
    var arr = Array.prototype.slice.call(arguments);
    console.log(util.format(fmt, arguments.slice(1).join(',')));
}

