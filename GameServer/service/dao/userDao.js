/**
 * Created by bin.hou on 2015/10/29.
 */
var utils = require('./../../utils/utils.js');
var util = require('util');
var mysqlManager = require('./mysqlManager.js');
var async = require('async');

var userDao = module.exports;

userDao.getUser = function(app, uid, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var sql = "select * from t_user where uid = ?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            console.log('get user error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

userDao.updateUser = function(app, user, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(user.uid);
    var uid = user.uid;
    delete user.uid;

    var args = [];
    var sql = "update t_user set ";
    for (var i in user) {
        sql += i + "=?" + ",";
        args.push(user[i]);
    }
    sql = sql.slice(0, sql.length - 1);
    sql += " where uid = ?";
    args.push(uid);
    mysqlCli.query(sql, args, function(err, res) {
        if (err !== null) {
            console.log('update user error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

userDao.addUser = function(app, user, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(user.uid);

    var sql = "", key = "", value = "";
    var real_val = [];
    for (var i in user) {
        key += i + ",";
        value += "?,";
        real_val.push(user[i]);
    }

    sql = util.format("insert into t_user(%s) values(%s)",
         key.substring(0, key.length-1), value.substring(0, value.length-1));

    mysqlCli.query(sql, real_val, function(err, res) {
        if (err !== null) {
            console.log('insert user error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}


