/**
 * Created by bin.hou on 2015/10/29.
 */

var util = require('util');
var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var sysMailDao = module.exports;

sysMailDao.getSysMail = function(app, check_tm, cur, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "select * from t_sys_mail where id > ? and expire > ? limit 10";
    mysqlCli.query(sql, [check_tm, cur], function(err, res) {
        if (err !== null) {
            console.log('get sysMail error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

sysMailDao.addOrUpdateSysMail = function(app, uid, sysMail, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();

    var sql = "", key = "uid,", value = "?,", update="";
    var args = [];
    args.push(uid);
    for (var i in sysMail) {
        key += i + ",";
        value += "?,";
        update += i + "=?,";
        args.push(sysMail[i]);
    }
    for (var i in sysMail) {
        args.push(sysMail[i]);
    }

    sql = util.format("insert into t_sys_mail(%s) values(%s) on duplicate key update %s",
        key.substring(0, key.length-1),
        value.substring(0, value.length-1),
        update.substring(0, update.length-1)
    );

    mysqlCli.query(sql, args, function(err, res) {
        if (err !== null) {
            console.log('insert sysMail error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}