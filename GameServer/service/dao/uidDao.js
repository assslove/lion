/**
 * @brief 账号池
 * Created by bin.hou on 2015/10/29.
 */

var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var uidDao = module.exports;

uidDao.getUnusedUids = function(app, cb)
{
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "select uid from t_uid where flag = 0";
    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            logger.error('get unused uid  error: %s', err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

uidDao.getMaxUid = function(app, cb)
{
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "select max(uid) as uid from t_uid";
    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            logger.error('get max uid  error: %s', err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

uidDao.insertOrUpdateUidFlag = function(app, uid, flag, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "insert into t_uid values(?, ?) on duplicate key update flag = ?";
    mysqlCli.query(sql, [uid, flag, flag], function(err, res) {
        if (err !== null) {
            logger.error('update uid flag  error: %s', err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

