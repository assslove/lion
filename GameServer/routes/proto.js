/**
 * @brief 协议处理
 * Created by houbin on 15-10-18.
 */

var express = require('express');
var router = express.Router();
var protoHandler = require('./../service/protoHandler.js');

router.post('/proto', function(req, res, next) {
    //check proto pkg
    if (req.body.length < 2) {

    }

    var userid = req.body[0];
    var protoid = req.body[1];

    protoHandler.handle(req, res, function(err) {
        if (err != null) {
            var ret = [userid];
        }
    });
});

module.exports = router;
