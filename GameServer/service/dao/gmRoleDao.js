/**
 * @brief 角色配置管理
 * Created by bin.hou on 2015/7/28.
 */


var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var roleConfigDao = module.exports;

roleConfigDao.getGmRoleList = function(req, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "select * from t_gm_role order by type desc";
    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            console.log('get role config list error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

roleConfigDao.insertGmRole = function(req, obj, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "insert into t_gm_role values(?, ?, ?)";
    mysqlCli.query(sql, [obj.type, obj.name, obj.perm], function(err, res) {
        if (err !== null) {
            console.log('insert role config error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

roleConfigDao.updateGmRole = function(req, obj, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "update t_gm_role set name=?, perm=? where type=?";
    mysqlCli.query(sql, [obj.name, obj.perm, obj.type], function(err, res) {
        if (err !== null) {
            console.log('update role config error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

roleConfigDao.deleteGmRole = function(req, obj, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "delete from t_gm_role where type=?";
    mysqlCli.query(sql, obj, function(err, res) {
        if (err !== null) {
            console.log('update role config error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

roleConfigDao.getGmRolePerm = function(req, obj, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "select t_gm_role.perm as perm from t_gm_user, t_gm_role where t_gm_user.username=? and t_gm_user.type = t_gm_role.type"
    mysqlCli.query(sql, [obj], function(err, res) {
        if (err !== null) {
            console.log('get role config perm error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}