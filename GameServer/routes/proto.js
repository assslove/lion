/**
 * @brief 协议处理
 * Created by houbin on 15-10-18.
 */

var express = require('express');
var fs = require("fs");
var path = require("path");

var DEFINE = require('./../proto/define.js');
var user = require('./../service/model/user.js');
var logger = require("./../utils/log.js");
var encrypt = require("./../utils/encrypt.js");
var protoManager = require('./../service/manager/protoManager.js');

var router = express.Router();

router.post('/', function(req, res, next) {
    //check proto pkg
    //var msg = new Buffer(encrypt.decode(req.body.b), "base64").toString();
    var msg = req.body.b;
	logger.debug(msg);
    var body = JSON.parse(msg);
    if (body.p == undefined) {
        logger.error("proto id is not null protoid=%d", body.p);
        res.send(500);
    }

    var protoid = body.p;
    var seq = body.s;
    var pkg = body.m;

    protoManager.handle(protoid, pkg, req, res, function(err) {
        if (err != null) {
            protoManager.sendErrorToUser(res, protoid, err);
        }
    });
});

module.exports = router;
