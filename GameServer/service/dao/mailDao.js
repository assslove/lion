/**
 * Created by bin.hou on 2015/10/29.
 */

var util = require('util');
var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var mailDao = module.exports;

mailDao.getMail = function(app, uid, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var sql = "select * from t_mail where uid = ? limit 1";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            console.log('get mail error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

mailDao.addOrUpdateMail = function(app, uid, mail, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "uid,", value = "?,", update="";
    var args = [];
    args.push(uid);
    for (var i in mail) {
        key += i + ",";
        value += "?,";
        update += i + "=?,";
        args.push(mail[i]);
    }
    for (var i in mail) {
        args.push(mail[i]);
    }

    sql = util.format("insert into t_mail(%s) values(%s) on duplicate key update %s",
        key.substring(0, key.length-1),
        value.substring(0, value.length-1),
        update.substring(0, update.length-1)
    );

    mysqlCli.query(sql, args, function(err, res) {
        if (err !== null) {
            console.log('insert mail error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}