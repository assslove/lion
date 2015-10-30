/**
 * Created by bin.hou on 2015/10/29.
 */

var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var copyDao = module.exports;

copyDao.getCopy = function(app, uid, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var sql = "select * from t_copy where uid = ?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            console.log('get copy error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

copyDao.updateCopy = function(app, copy, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var uid = copy.uid;
    delete copy.uid;

    var sql = "update t_copy set ";
    for (var i in copy) {
        sql += i + "=" + copy[i] + ",";
    }
    sql = sql.slice(0, sql.length - 1);
    sql += " where uid = ?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            console.log('update copy error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

copyDao.addCopy = function(app, copy, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "", value = "";
    for (var i in copy) {
        key += i + ",";
        value += i + ",";
    }

    sql = util.format("insert into t_copy(%s) values(%s)",
         key.substring(0, key.length-1), value.substring(0, value.length-1));

    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            console.log('insert copy error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

copyDao.addOrUpdateCopy = function(app, copy, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "", value = "", update="";
    for (var i in copy) {
        key += i + ",";
        value += i + ",";
        update += i + "=" + copy[i] + ",";
    }

    sql = util.format("insert into t_copy(%s) values(%s) on duplicate key update %s",
        key.substring(0, key.length-1),
        value.substring(0, value.length-1),
        update.substring(0, update.length-1)
    );

    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            console.log('insert copy error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}