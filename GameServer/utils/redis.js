/**
 * @brief 用于负责对redis操作接口
 * Created by bin.hou on 2015/5/12.
 */

var redisModule = require("redis");
var session = require("express-session");
var utils = require('../utils/utils.js');
var logger = require('../utils/log.js');

var redisClient = module.exports;

/* @brief 初始化redis
 */
redisClient.init = function(app) {
    var redisConfig = app.get('redis');
    var redis = redisModule.createClient(redisConfig.port, redisConfig.host, {});
    if (redis === null) {
        app.settings.logger.error("redis init failed!");
    } else {
        if (app.get('env') == "development") {
            redis.debug = true;
        }
        redis.select(0, function(err, res) {
            app.settings.logger.info("redisclient create ", res);
        });

		redis.on("error", function (err) {
			app.get("logger").error("redis error " + err);
		});
        //设置session地址
        var RedisStore = require('connect-redis')(session);
        app.use(session({
            store : new RedisStore({
                host : redisConfig.host,
                port : redisConfig.port,
                db : 0
            }),
            secret : "keyboard cat",
            resave : false,
            saveUninitialized : false,
            cookie: {maxAge: 80000,  path: '/', httpOnly : true}
        }));
	}

	return redis;
}

redisClient.set = function(app, key, value, cb) {
	app.get('redisclient').set(key, value, function(err, res) {
		if (err !== null) {
			app.settings.logger.error("exec set failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, null);
		}
	});
}

redisClient.hset = function(app, hash, key, val, cb) {
	app.get('redisclient').hset(hash, key, val, function(err, res) {
		if (err !== null) {
			app.settings.logger.error("exec hset failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, null);
		}
	});
}

redisClient.hget = function(app, hash, key,  cb) {
	app.get('redisclient').hget(hash, key, function(err, res) {
		if (err !== null) {
			app.settings.logger.error("exec hget failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.get = function(app, key, cb) {
	app.get('redisclient').get(key, function(err, res) {
		if (err !== null) {
			app.settings.logger.error("exec set failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			app.settings.logger.info(res);
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.fini = function(app) {
	app.get('redisclient').end();
}
