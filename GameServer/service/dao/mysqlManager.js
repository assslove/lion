/**
 * @brief mysql 管理类
 * Created by bin.hou on 2015/7/3.
 */

var util = require("util");
var logger = require("./../../utils/log.js");
var MysqlCli = require("./mysqlCli.js");

var mysqlList = {};

var mysqlManager = module.exports;

mysqlManager.addMysqlCli = function(id, obj) {
    var ids = id.join(',');
    for (var i in mysqlList) {
        if (i === ids) {
            mysqlManager.delMysqlCli(id);
        }
    }
    mysqlList[ids] = obj;
    logger.info("add game mysql connnect success [%s]", ids);
}

mysqlManager.delMysqlCli = function(id) {
    var ids = id.join(',');
    for (var i in mysqlList) {
        if (i === ids) {
            if (mysqlList[i] !== null) {
                mysqlList[i].destroy();
                delete mysqlList[i];
                console.info(util.format("del game mysql connnect success [%s]", i));
            }
        }
    }
}

mysqlManager.getMysqlCli = function(userid) {
    var mod = userid % 100;
    for (var i in mysqlList) {
        var range = i.split(',');
        if (mod >= range[0] && mod <= range[1]) {
            return mysqlList[i];
        }
    }

    console.log(util.format("cannot find mysql userid=%d", userid));

    return null;
}

mysqlManager.init = function(app) {
    var conf = app.get('mysql');
    for (var i in conf) {
        var mysqlCli = new MysqlCli(app, conf[i]);
        if (mysqlCli === null) {
            app.get('logger').error(util.format("mysql init error [%d,%d]", conf[i].range[0], conf[i].range[1]));
            return false;
        }
        mysqlManager.addMysqlCli(conf[i].range, mysqlCli);
    }

    app.get('logger').info("init mysql success");
}

mysqlManager.getGlobalMysql = function() {
    return mysqlList["100,199"];
}