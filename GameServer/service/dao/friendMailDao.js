/**
 * Created by bin.hou on 2015/11/14.
 */

var util = require('util');
var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var friendMailDao = module.exports;

friendMailDao.getFriendMail = function(app, uid, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var sql = "select * from t_friend_mail where uid = ?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            console.log('get friend_mail error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}


friendMailDao.addOrUpdateFriendMail = function(app, uid, friendMail, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "uid,", value = "?,", update="";
    var args = [];
    args.push(uid);
    for (var i in friendMail) {
        key += i + ",";
        value += "?,";
        update += i + "=?,";
        args.push(friendMail[i]);
    }
    for (var i in friendMail) {
        args.push(friendMail[i]);
    }

    sql = util.format("insert into t_friend_mail(%s) values(%s) on duplicate key update %s",
        key.substring(0, key.length-1),
        value.substring(0, value.length-1),
        update.substring(0, update.length-1)
    );

    mysqlCli.query(sql, args, function(err, res) {
        if (err !== null) {
            console.log('insert friendMail error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

friendMailDao.initData = function(app, uid, callback) {
    var friendMail = {
        get_hp_times : 0,
        get_gold_times : 0
		friendid : "",
    };

    friendMailDao.addOrUpdateFriendMail(app, uid, friendMail, callback);
}
