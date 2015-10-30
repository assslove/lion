/**
 * Created by bin.hou on 2015/10/29.
 */

var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var itemDao = module.exports;

itemDao.getItem = function(app, uid, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var sql = "select * from t_item where uid = ?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            console.log('get item error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

itemDao.updateItem = function(app, item, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var uid = item.uid;
    delete item.uid;

    var sql = "update t_item set ";
    for (var i in item) {
        sql += i + "=" + item[i] + ",";
    }
    sql = sql.slice(0, sql.length - 1);
    sql += " where uid = ?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            console.log('update item error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

itemDao.addItem = function(app, item, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "", value = "";
    for (var i in item) {
        key += i + ",";
        value += i + ",";
    }

    sql = util.format("insert into t_item(%s) values(%s)",
         key.substring(0, key.length-1), value.substring(0, value.length-1));

    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            console.log('insert item error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

itemDao.addOrUpdateItem = function(app, item, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "", value = "", update="";
    for (var i in item) {
        key += i + ",";
        value += i + ",";
        update += i + "=" + item[i] + ",";
    }

    sql = util.format("insert into t_item(%s) values(%s) on duplicate key update %s",
        key.substring(0, key.length-1),
        value.substring(0, value.length-1),
        update.substring(0, update.length-1)
    );

    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            console.log('insert item error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}