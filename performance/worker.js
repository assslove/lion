/**
 * @brief 子进程 worker.js
 * Created by bin.hou on 2015/12/31.
 */

var async = require('async');
var model = require('./model.js');
var util = require('util');

var total = 1000;
var i = 0;
async.whilst(
    function() {return i < total;},
    function(callback) {
        var start = new Date().getTime();
        model.userCreate("test_" + i, function(err, result) {
            var end = new Date().getTime();
            console.log(util.format("success create user : %d, %d", result, end - start));
            ++i;
            callback(err);
        });
    },
    function(err) {
        console.log("success create users");
    }
);

