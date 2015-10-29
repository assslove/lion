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
    for (var i in mysqlList) {
        if (i[0].start === id[0] && i[1] === id[1]) {
            mysqlManager.delMysqlCli(id);
        }
    }
    mysqlList[id] = obj;
    logger.info("add game mysql connnect success [%d,%d]", id[0], id[1]);
}

mysqlManager.delMysqlCli = function(id) {
    for (var i in mysqlList) {
        if (i[0].start === id[0] && i[1] === id[1]) {
            if (mysqlList[i] !== null) {
                mysqlList[i].destroy();
                mysqlList.splice(i, 1);
                console.info(util.format("del game mysql connnect success [%d,%d]", id[0], id[1]));
            }
        }
    }
}

mysqlManager.getMysqlCli = function(userid) {
    var mod = userid % 100;
    for (var i in mysqlList) {
        if (mod >= i[0] && mod <= i[1]) {
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
    for (var i in mysqlList) {
        if (i[0] === 100) {
            return mysqlList[i];
        }
    }

    console.log("cannot find global mysql");

    return null;
}