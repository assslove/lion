/**
 * Created by bin.hou on 2015/10/29.
 */

var util = require('util');
var utils = require('./../../utils/utils.js');
var mysqlManager = require('./mysqlManager.js');
var logger = require('./../../utils/log.js');

var petDao = module.exports;

petDao.getPet = function(app, uid, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var sql = "select * from t_pet where uid = ?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            console.log('get pet error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

petDao.updatePet = function(app, pet, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);
    var uid = pet.uid;
    delete pet.uid;

    var sql = "update t_pet set ";
    for (var i in pet) {
        sql += i + "=" + pet[i] + ",";
    }
    sql = sql.slice(0, sql.length - 1);
    sql += " where uid = ?";
    mysqlCli.query(sql, [uid], function(err, res) {
        if (err !== null) {
            console.log('update pet error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

petDao.addPet = function(app, pet, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "", value = "";
    for (var i in pet) {
        key += i + ",";
        value += i + ",";
    }

    sql = util.format("insert into t_pet(%s) values(%s)",
         key.substring(0, key.length-1), value.substring(0, value.length-1));

    mysqlCli.query(sql, null, function(err, res) {
        if (err !== null) {
            console.log('insert pet error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}

petDao.addOrUpdatePet = function(app, uid, pet, cb) {
    var mysqlCli = mysqlManager.getMysqlCli(uid);

    var sql = "", key = "uid,", value = "?,", update="";
    var args = [];
    args.push(uid);
    for (var i in pet) {
        key += i + ",";
        value += "?,";
        update += i + "=?,";
        args.push(pet[i]);
    }
    for (var i in pet) {
        args.push(pet[i]);
    }

    sql = util.format("insert into t_pet(%s) values(%s) on duplicate key update %s",
        key.substring(0, key.length-1),
        value.substring(0, value.length-1),
        update.substring(0, update.length-1)
    );

    mysqlCli.query(sql, args, function(err, res) {
        if (err !== null) {
            console.log('insert pet error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
}