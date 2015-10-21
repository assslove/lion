/**
 * Created by houbin on 15-10-18.
 */

var ProtoBuf = require("protobufjs");
var builder = ProtoBuf.loadProtoFile("./../../proto/user.proto");
var DEFINE = require('./../../proto/define.js');
var logger = require("./../../utils/log.js");

var userController = module.exports;

userController.userLogin = function(pkg, req, res, cb) {
    req.session.uid = pkg.uid;
    req.session.cookie.expires = false;
    req.session.save();

    logger.info("%d user login", pkg.uid);
}

userController.userLogout = function(pkg, req, res, cb) {
    if (req.session) {
        req.session.destroy(function() {

        });
    }

    logger.info("%d user logout", pkg.uid);
}

userController.userCreate = function(pkg, req, res, cb) {

    logger.info("%d user create", pkg.uid);
}