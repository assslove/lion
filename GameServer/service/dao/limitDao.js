/**
 * Created by bin.hou on 2015/10/29.
 */

var util = require('util');
var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var limitDao = module.exports;

limitDao.getLimit = function(app, uid, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var sql = "select * from t_limit where uid = ? limit 1";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            console.log('get limit error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

limitDao.updateLimit = function(app, limit, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var uid = limit.uid;
    delete limit.uid;

    var sql = "update t_limit set ";
    for (var i in limit) {
        sql += i + "=" + limit[i] + ",";
    }
    sql = sql.slice(0, sql.length - 1);
    sql += " where uid = ?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            console.log('update limit error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

limitDao.addLimit = function(app, limit, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "", value = "";
    for (var i in limit) {
        key += i + ",";
        value += i + ",";
    }

    sql = util.format("insert into t_limit(%s) values(%s)",
         key.substring(0, key.length-1), value.substring(0, value.length-1));

    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            console.log('insert limit error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

limitDao.addOrUpdateLimit = function(app, uid, limit, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "uid,", value = "?,", update="";
    var args = [];
    args.push(uid);
    for (var i in limit) {
        key += i + ",";
        value += "?,";
        update += i + "=?,";
        args.push(limit[i]);
    }
    for (var i in limit) {
        args.push(limit[i]);
    }

    sql = util.format("insert into t_limit(%s) values(%s) on duplicate key update %s",
        key.substring(0, key.length-1),
        value.substring(0, value.length-1),
        update.substring(0, update.length-1)
    );

    mysqlCli.query(sql, args, function(err, res) {
        if (err !== null) {
            console.log('add or update limit error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}
