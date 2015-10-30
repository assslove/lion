/**
 * @brief 用户账号关联表
 * Created by bin.hou on 2015/10/29.
 */

var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var accountDao = module.exports;

accountDao.getUidByQQ = function(app, qq, cb)
{
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "select uid from t_account where qq = %u";
    mysqlCli.query(sql, [qq], function(err, res) {
        if (err !== null) {
            logger.error('get user error: %s', err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}


