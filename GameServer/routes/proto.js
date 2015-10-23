/**
 * @brief 协议处理
 * Created by houbin on 15-10-18.
 */

var express = require('express');
var ProtoBuf = require("protobufjs");
var fs = require("fs");
var path = require("path");

var DEFINE = require('./../proto/define.js');
var user = require('./../service/model/user.js');
var logger = require("./../utils/log.js");
var bufferpack = require("bufferpack");

var router = express.Router();

router.post('/', function(req, res, next) {
    //check proto pkg
    var buffer = new Buffer(req.rawBody);
    if (buffer.length < 8) {
        logger.error("proto len is too small [len=%d]", buffer.length);
        res.send(500);
    }
    var len = buffer.readUInt32LE(0);
    var protoid = buffer.readUInt16LE(4);
    var seq = buffer.readUInt16LE(6);

    //check seq

    var msg = buffer.slice(8);

    if (msg.length + 8 !== len) {
        logger.error("proto len is not right [total_len=%d,, real_len=%d, pkg_len=%d]", buffer.length, len, msg.length);
        req.app.get("proto_handler").sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.PROTO_LEN_INVALID[0]);
    }

    req.app.get("proto_handler").handle(protoid, msg, req, res, function(err) {
        if (err != null) {
            req.app.get("proto_handler").sendErrorToUser(res, protoid, err);
        }
    });
});

module.exports = router;
