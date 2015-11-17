/**
 * Created by bin.hou on 2015/11/14.
 */

var util = require('util');
var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var friendDao = module.exports;

friendDao.getFriend = function(app, uid, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var sql = "select * from t_friend where uid = ?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            console.log('get friend error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}


friendDao.addOrUpdateFriend = function(app, uid, friend, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "uid,", value = "?,", update="";
    var args = [];
    args.push(uid);
    for (var i in friend) {
        key += i + ",";
        value += "?,";
        update += i + "=?,";
        args.push(friend[i]);
    }
    for (var i in friend) {
        args.push(friend[i]);
    }

    sql = util.format("insert into t_friend(%s) values(%s) on duplicate key update %s",
        key.substring(0, key.length-1),
        value.substring(0, value.length-1),
        update.substring(0, update.length-1)
    );

    mysqlCli.query(sql, args, function(err, res) {
        if (err !== null) {
            console.log('insert friend error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}