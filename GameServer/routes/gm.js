/**
 * @brief GM命令 用于对服务器进行一些操作
 * Created by bin.hou on 2015/10/29.
 */

var express = require('express');
var async = require('async');

var router = express.Router();

var uidDao = require('../service/dao/uidDao.js');

router.get('/gen_uid', function(req, res, next) {
    var count = req.query.count;

    uidDao.getMaxUid(req.app, function(err, res) {
        if (err !== null) return res.send(err.message);

        var start = 0;
        if (res.length != 0)  start = res[0] + 1;
        var end = start + count;


    });
});

module.exports = router;