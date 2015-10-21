/**
 * @brief 协议处理
 * Created by houbin on 15-10-18.
 */

var express = require('express');
var ProtoBuf = require("protobufjs");
var fs = require("fs");
var path = require("path");

var protoHandler = require('./../service/protoHandler.js');
var DEFINE = require('./../proto/define.js');
var user = require('./../service/model/user.js');
var logger = require("./../utils/log.js");
var bufferpack = require("bufferpack");

var router = express.Router();

var PROTO_FILE = path.join(__dirname, "../proto/user.proto");

function send_error_to_user(res, err) {
    var userProtoStr = fs.readFileSync(PROTO_FILE).toString();
    var builder = ProtoBuf.loadProto(userProtoStr);
    var Game = builder.build("game");
    var ErrorCodeRet = Game.ErrorCodeRet;
    var error = new ErrorCodeRet({
        err_code : err
    });

    var msg = error.encode().toBuffer();
    var len = msg.length + 8;
    var head = bufferpack("<II", [len, DEFINE.PROTO.ERROR_CODE]);
    var buffer = Buffer.concat([head, msg], len);
    res.send(buffer);
}

router.post('/', function(req, res, next) {
    //check proto pkg
    var buffer = new Buffer(req.rawBody);
    if (buffer.length < 8) {
        logger.error("proto len is too small [len=%d]", buffer.length);
        send_error_to_user(res, DEFINE.ERROR_CODE.PROTO_LEN_INVALID);
    }
    var len = buffer.readUInt32LE(0);
    var protoid = buffer.readUInt32LE(4);
    var msg = buffer.slice(8);

    if (msg.length + 8 !== len) {
        logger.error("proto len is not right [total_len=%d,, real_len=%d, pkg_len=%d]", buffer.length, len, msg.length);
        send_error_to_user(res, DEFINE.ERROR_CODE.PROTO_LEN_INVALID);
    }

    protoHandler.handle(protoid, msg, req, res, function(err) {
        if (err != null) {
            send_error_to_user(res, err);
        }
    });
});

module.exports = router;
