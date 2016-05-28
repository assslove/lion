/**
 * Created by houbin on 15-11-1.
 */

var async = require('async');

var DEFINE = require('./../../proto/define.js');
var logger = require("./../../utils/log.js");
var cacheManager = require("./../manager/cacheManager.js");
var CODE = require("./../../utils/code.js");
var utils = require('./../../utils/utils.js');
var protoManager = require('./../manager/protoManager.js');
var limitDao = require('./../dao/limitDao.js');
var userModel = require('./../model/user.js');

var limitController = module.exports;

limitController.getSomeLimit = function(protoid, pkg, req, res, cb) {

    if (pkg.key == null || pkg.key.length === 0) {
        return cb(DEFINE.ERROR_CODE.PROTO_DATA_INVALID[0]);
    }

    cacheManager.getLimit(req.app, pkg.uid, function(err, results) {
        var limitMap = {};
        for (var i in results) {
            limitMap[results[i].key] = results[i].value;
        }

        var someLimits = [];

        for (var i = 0; i < pkg.key.length; ++i) {
            var value = limitMap[pkg.key[i]];
            if (value == null) {
                value = 0;
            }
            someLimits.push([pkg.key[i], value]);
        }

        var limits = {limit : someLimits};
        protoManager.sendMsgToUser(res, protoid, limits);
    });
}


