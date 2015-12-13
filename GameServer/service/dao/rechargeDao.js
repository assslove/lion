/**
 * Created by bin.hou on 2015/10/29.
 */

var util = require('util');
var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var rechargeDao = module.exports;

rechargeDao.addOrUpdateRecharge = function(app, uid, recharge, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "uid,", value = "?,", update="";
    var args = [];
    args.push(uid);
    for (var i in recharge) {
        key += i + ",";
        value += "?,";
        update += i + "=?,";
        args.push(recharge[i]);
    }
    for (var i in recharge) {
        args.push(recharge[i]);
    }

    sql = util.format("insert into t_recharge(%s) values(%s) on duplicate key update %s",
        key.substring(0, key.length-1),
        value.substring(0, value.length-1),
        update.substring(0, update.length-1)
    );

    mysqlCli.query(sql, args, function(err, res) {
        if (err !== null) {
            console.log('insert recharge error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}