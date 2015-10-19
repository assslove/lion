/**
 * @brief mysql 管理类
 * Created by bin.hou on 2015/7/3.
 */

var mysqlList = {};

var mysqlManager = module.exports;

mysqlManager.addMysqlCli = function(id, pool) {
    if (mysqlList[id] != null) {
        mysqlManager.delMysqlCli(id);
    }
    mysqlList[id] = pool;
    console.log("add game mysql connnect " + id);
}

mysqlManager.delMysqlCli = function(id) {
    if (mysqlList[id] !== null) {
        mysqlList[id].destroy();
        delete mysqlList[id];
        console.log("del game mysql connnect " + id);
    }
}

mysqlManager.getMysqlCli = function(id) {
    return mysqlList[id];
}

mysqlManager.init = function(app) {

}
