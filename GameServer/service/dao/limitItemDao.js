/**
 * Created by bin.hou on 2015/10/29.
 */

var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var limitItemDao = module.exports;

limitItemDao.getLimitItem = function(app, uid, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var sql = "select * from t_limit_item where uid = ?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            logger.error('get limitItem error: %s', err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

limitItemDao.updateLimitItem = function(app, limitItem, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var uid = limitItem.uid;
    delete limitItem.uid;

    var sql = "update t_limit_item set ";
    for (var i in limitItem) {
        sql += i + "=" + limitItem[i] + ",";
    }
    sql = sql.slice(0, sql.length - 1);
    sql += " where uid = ?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            logger.error('update limitItem error: %s ', err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

limitItemDao.addLimitItem = function(app, limitItem, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "", value = "";
    for (var i in limitItem) {
        key += i + ",";
        value += i + ",";
    }

    sql = util.format("insert into t_limit_item(%s) values(%s)",
         key.substring(0, key.length-1), value.substring(0, value.length-1));

    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            logger.error('insert limitItem error: %s', err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

limitItemDao.addOrUpdateLimitItem = function(app, limitItem, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "", value = "", update="";
    for (var i in limitItem) {
        key += i + ",";
        value += i + ",";
        update += i + "=" + limitItem[i] + ",";
    }

    sql = util.format("insert into t_limit_item(%s) values(%s) on duplicate key update %s",
        key.substring(0, key.length-1),
        value.substring(0, value.length-1),
        update.substring(0, update.length-1)
    );

    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            logger.error('insert limitItem error: %s', err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}