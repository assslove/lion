/**
 * @brief 用于负责对redis操作接口
 * Created by bin.hou on 2015/5/12.
 */

var redisModule = require("redis");
var session = require("express-session");
var utils = require('../utils/utils.js');
var logger = require('../utils/log.js');

module.exports = function(app) {
	return RedisClient(app);
}

function RedisClient(app) {
	this.app = app;
	this.handle = null;
}

/* @brief 初始化redis
 */
RedisClient.prototype.init = function() {
    var redisConfig = this.app.get('redis');
    this.handle = redisModule.createClient(redisConfig.port, redisConfig.host, {});
    if (this.handle === null) {
        logger.error("redis init failed!");
    } else {
        if (this.app.get('env') == "development") {
            redis.debug = true;
        }
        this.handle.select(0, function(err, res) {
            logger.info("redisclient create %s", res);
        });

		this.handle.on("error", function (err) {
			logger.error("redis error : %s" + err);
		});
        //设置session地址
        var RedisStore = require('connect-redis')(session);
        this.app.use(session({
            store : new RedisStore({
                host : redisConfig.host,
                port : redisConfig.port,
                db : 1
            }),
            secret : "keyboard cat",
            resave : false,
            saveUninitialized : false,
            cookie: {maxAge: 80000,  path: '/', httpOnly : true}
        }));
	}

	return this.handle;
}

RedisClient.prototype.set = function(key, value, cb) {
	this.handle.set(key, value, function(err, res) {
		if (err !== null) {
			logger.error("exec set failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, null);
		}
	});
}

RedisClient.prototype.hset = function(hash, key, val, cb) {
	this.handle.hset(hash, key, val, function(err, res) {
		if (err !== null) {
			logger.error("exec hset failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, null);
		}
	});
}

RedisClient.prototype.hget = function(hash, key,  cb) {
	this.handle.hget(hash, key, function(err, res) {
		if (err !== null) {
			logger.error("exec hget failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

RedisClient.prototype.get = function(key, cb) {
	this.handle.get(key, function(err, res) {
		if (err !== null) {
			logger.error("exec get failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			logger.info(res);
			utils.invokeCallback(cb, null, res);
		}
	});
}

RedisClient.prototype.sadd = function(key, uid, cb) {
 	this.handle.sadd(key, uid, function(err, res) {
		if (err !== null) {
			logger.error("exec sadd failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			logger.info(res);
			utils.invokeCallback(cb, null, res);
		}
	});
}


RedisClient.prototype.srem = function(key, uid, cb) {
 	this.handle.srem(key, uid, function(err, res) {
		if (err !== null) {
			logger.error("exec srem failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			logger.info(res);
			utils.invokeCallback(cb, null, res);
		}
	});
}


RedisClient.prototype.srandmember = function(key, cb) {
 	this.handle.srandmember(key, function(err, res) {
		if (err !== null) {
			logger.error("exec srandmemeber failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			logger.info(res);
			utils.invokeCallback(cb, null, res);
		}
	});
}

RedisClient.prototype.fini = function() {
	this.handle.end();
}

RedisClient.prototype.scard = function(key, cb) {
 	this.handle.scard(key, function(err, res) {
		if (err !== null) {
			logger.error("exec scard failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			logger.info(res);
			utils.invokeCallback(cb, null, res);
		}
	});
}
