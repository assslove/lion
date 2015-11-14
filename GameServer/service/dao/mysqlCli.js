/* @brief 提供游戏mysql查询类
 */
var mysql = require('mysql');
var logger = require('./../../utils/log.js');

module.exports = function(app, conf) {
   return new MysqlCli(app, conf);
}

function MysqlCli(app, conf) {
    this.pool = null;
    this.app = app;

    var debug = false;
    if (app.get('env') == "development") {
        debug = true;
    }
    this.pool = mysql.createPool({
        host : conf.host,
        port : conf.port,
        user : conf.user,
        password : conf.password,
        database : conf.db,
        supportBigNumbers : true,
        debug : debug
    });

    if (!!this.pool) {
        console.log('mysql is connected to [%s:%d]', conf.host, conf.port);
    }
}

MysqlCli.prototype.query = function(sql, args, cb) {
	console.log(sql);
    logger.debug(sql);
    this.pool.getConnection(function(err, conn) {
        if (err == null) {
            conn.query(sql, args, function(err, res) {
                cb(err, res);
                conn.release();
            });
        } else {
            console.log('cannot get connection');
        }
    });
}

MysqlCli.prototype.destroy = function(cb) {
    if (!!this.pool) {
        this.pool.end(function(err) {
            if (err === undefined) {
                console.log('all connections in the pool have ended');
                this.pool = null;
                cb();
            }
        });
    } else {
       cb();
    }
}
