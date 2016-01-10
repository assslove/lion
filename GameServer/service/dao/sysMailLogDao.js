/**
 * Created by bin.hou on 2015/10/29.
 */

var util = require('util');
var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var sysMailLogDao = module.exports;

sysMailLogDao.getSysMailLogByCond = function(app, query, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();
    var where = "";
    var tmp = {};
    if (query.uid != "") {
        where += " uid="+query.uid;
    }

    if (query.begin_time != "") {
        if (where != "") where += " and ";
        where += " id>=" + query.begin_time;
    }

    if (query.end_time != "") {
        if (where != "") where += " and ";
        where += " id<=" + query.end_time;
    }

    if (query.title != "") {
        if (where != "") where += " and ";
        where += " title like '%" + query.title + "%' ";
    }

    if (where != "") where = "where" + where;
    var sql = "select id, uid, title, expire from t_sysmail_log " + where + " order by id desc limit 50";

    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            console.log('get sysMailLog error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

sysMailLogDao.addOrUpdateSysMailLog = function(app, sysMailLog, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();

    var sql = "", key = "", value = "", update="";
    var args = [];
    for (var i in sysMailLog) {
        key += i + ",";
        value += "?,";
        args.push(sysMailLog[i]);
    }

    delete sysMailLog.id;
    delete sysMailLog.uid;

    for (var i in sysMailLog) {
        update += i + "=?,";
        args.push(sysMailLog[i]);
    }

    sql = util.format("insert into t_sysmail_log(%s) values(%s) on duplicate key update %s",
        key.substring(0, key.length-1),
        value.substring(0, value.length-1),
        update.substring(0, update.length-1)
    );

    mysqlCli.query(sql, args, function(err, res) {
        if (err !== null) {
            console.log('insert sysMailLog error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

sysMailLogDao.getOneSysMailLog= function(app, id, uid, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "select * from t_sysmail_log where id=? and uid=? limit 1";

    mysqlCli.query(sql, [id, uid], function(err, res) {
        if (err !== null) {
            console.log('get one sysMailLog error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}