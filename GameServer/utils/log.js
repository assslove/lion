/**
 * @brief 日志定义
 * Created by bin.hou on 2015/10/20.
 */

var util = require('util');
var utils = require("./../utils/utils.js");

var logger = module.exports;

var g_handle = null;
var g_app = null;

logger.init = function(app, handle) {
    g_app = app;
    g_handle = handle;
}

logger.error = function() {
    g_handle.error(util.format.apply(this, arguments));
}

logger.info = function() {
    g_handle.info(util.format.apply(this, arguments));
}

logger.debug = function() {
    g_handle.debug(util.format.apply(this, arguments));
}

logger.stout = function() {
    console.log(util.format.apply(this, arguments));
}

