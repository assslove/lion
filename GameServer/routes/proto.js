/**
 * @brief 协议处理
 * Created by houbin on 15-10-18.
 */

var express = require('express');
var ProtoBuf = require("protobufjs");

var protoHandler = require('./../service/protoHandler.js');
var DEFINE = require('./../proto/define.js');
var user = require('./../service/model/user.js');

var builder = ProtoBuf.loadProtoFile("./../proto/user.proto");
var router = express.Router();

function send_error_to_user(res, err) {
    var ErrorCodeRet = builder.build("game.ErrorCodeRet");
    var error = new ErrorCodeRet({
        err_code : err
    });

    var ret = JSON.stringify([DEFINE.PROTO.ERROR_CODE, error.encode().toBuffer()]);
    res.send(ret);
}

router.post('/', function(req, res, next) {
    //check proto pkg
    var pkg = JSON.parse(req.body);

    if (pkg.length == undefined || pkg.length == 0) {
        send_error_to_user(res, DEFINE.ERROR_CODE.PROTO_LEN_INVALID);
    }

    protoHandler.handle(pkg, req, res, function(err) {
        if (err != null) {
            send_error_to_user(res, err);
        }
    });
});

module.exports = router;
