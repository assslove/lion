/**
 * @brief 用户账号关联表
 * Created by bin.hou on 2015/10/29.
 */

var util = require('util');
var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var accountDao = module.exports;

accountDao.getUidByChannel = function(app, channel, channel_uid, cb)
{
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "select uid from t_account where channel = ? and channel_uid=? limit 1";
    mysqlCli.query(sql, [channel, channel_uid], function(err, res) {
        if (err !== null) {
            logger.error('get user error: %s', err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}


accountDao.addOrUpdateAccount = function(app, account, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(account.uid);

    var sql = "", key = "", value = "", update="";
    var real_val = [];
    for (var i in account) {
        key += i + ",";
        value += "?,";
        update += i + "=?,";
        real_val.push(account[i]);
    }

    for (var i in account) {
        real_val.push(account[i]);
    }
    sql = util.format("insert into t_account(%s) values(%s) on duplicate key update %s",
        key.substring(0, key.length-1),
        value.substring(0, value.length-1),
        update.substring(0, update.length-1)
    );

    mysqlCli.query(sql, real_val, function(err, res) {
        if (err !== null) {
            console.log('insert account error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

accountDao.delAccount = function(app, uid, cb)
{
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "delete from t_account where uid=?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            logger.error('del account error: %s', err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}