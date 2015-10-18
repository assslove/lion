/* @brief 提供mysql查询类
 */

var sqlclient = module.exports;
var mysql = require('mysql');
var pool = null;

sqlclient.init = function(app) {
    if (!!pool) {
        return sqlclient;
    } else {
        var mysqlConfig = app.get('mysql');
        var debug = false;
        if (app.get('env') == "development") {
            debug = true;
        }
        pool = mysql.createPool({
            host : mysqlConfig.host,
            port : mysqlConfig.port,
            user : mysqlConfig.user,
            password : mysqlConfig.password,
            database : mysqlConfig.database,
            supportBigNumbers : true,
            debug : debug
        });

        if (!!pool) {
            console.log('mysql pool is created success');
        }
    }

    return pool;
}

sqlclient.query = function(sql, args, cb) {
	console.log(sql);
    pool.getConnection(function(err, conn) {
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

sqlclient.destroy = function() {
    pool.end(function(err) {
        if (!!err) {
            console.log('all connections in the pool have ended');
        }
    })
}
