/**
 * @brief 用户管理 默认只存在admin用户，只有admin用户有用户管理的功能
 *          第一次登录时赋值为初始密码 之后再修改
 * Created by bin.hou on 2015/5/29.
 */

var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var userDao = module.exports;

/* @brief 获取用户信息
 */
userDao.getGmUser = function(app, username, cb) {
    var sql = "select * from t_gm_user where username = ?";
    var args = [username];
    var mysqlCli = mysqlManager.getGlobalMysql();
    mysqlCli.query(sql, args, function(err, res) {
        if (err !== null) {
            console.log('get user error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

/* @brief 增加用户
 */
userDao.addGmUser = function(app, args, cb) {
    var sql = "insert into t_gm_user values(?, ?, ?)";
    var mysqlCli = mysqlManager.getGlobalMysql();
    mysqlCli.query(sql, args, function(err, res) {
        if (err !== null) {
            console.log('add user error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

/* @brief 删除用户
 */
userDao.delGmUser = function(app, username, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "delete from t_gm_user where username = ?";
    mysqlCli.query(sql, [username], function(err, res) {
        if (err !== null) {
            console.log('del user error : ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

/* @brief 更新用户密码
 */
userDao.updateGmUser = function(app, args, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "update t_gm_user set password = ? where username = ?";
    mysqlCli.query(sql, args, function(err, res) {
        if (err !== null) {
            console.log('update user error : ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

/* @brief 获取用户列表
 */
userDao.getGmUserList = function(app, cb) {
    var mysqlCli = mysqlManager.getGlobalMysql();
    var sql = "select t_gm_user.username as username, t_gm_role.name as name from t_gm_user, t_gm_role where t_gm_user.type = t_gm_role.type";
    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            console.log('get user list error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}
