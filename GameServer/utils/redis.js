/**
 * @brief 用于负责对redis操作接口
 * Created by bin.hou on 2015/5/12.
 */

var redisModule = require("redis");
var session = require("express-session");
var utils = require('../utils/utils.js');
var logger = require('../utils/log.js');


var handler = null;
var app = null;

var redisClient = module.exports;

/* @brief 初始化redis
 */
redisClient.init = function(app_) {
	app = app_;
    var redisConfig = app.get('redis');
    handler = redisModule.createClient(redisConfig.port, redisConfig.host, {});
    if (handler === null) {
        logger.error("redis init failed!");
    } else {
        if (app.get('env') == "development") {
            redisModule.debug = true;
        }
        handler.select(0, function(err, res) {
            logger.info("redisclient create %s", res);
        });

		handler.on("error", function (err) {
			logger.error("redis error : %s" + err);
		});
	}

	return handler;
}

redisClient.setex = function(key, expire, value, cb) {
	handler.setex(key, expire, value, function(err, res) {
		if (err !== null) {
			logger.error("exec setex failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, null);
		}
	});
}

redisClient.set = function(key, value, cb) {
	handler.set(key, value, function(err, res) {
		if (err !== null) {
			logger.error("exec set failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, null);
		}
	});
}

redisClient.set = function(key, value, cb) {
	handler.set(key, value, function(err, res) {
		if (err !== null) {
			logger.error("exec set failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, null);
		}
	});
}

redisClient.hset = function(hash, key, val, cb) {
	handler.hset(hash, key, val, function(err, res) {
		if (err !== null) {
			logger.error("exec hset failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, null);
		}
	});
}

redisClient.hget = function(hash, key,  cb) {
	handler.hget(hash, key, function(err, res) {
		if (err !== null) {
			logger.error("exec hget failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.get = function(key, cb) {
	handler.get(key, function(err, res) {
		if (err !== null) {
			logger.error("exec get failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.sadd = function(key, uid, cb) {
 	handler.sadd(key, uid, function(err, res) {
		if (err !== null) {
			logger.error("exec sadd failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}


redisClient.srem = function(key, uid, cb) {
 	handler.srem(key, uid, function(err, res) {
		if (err !== null) {
			logger.error("exec srem failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}


redisClient.srandmember = function(key, cb) {
 	handler.srandmember(key, function(err, res) {
		if (err !== null) {
			logger.error("exec srandmemeber failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.fini = function() {
	handler.end();
}

redisClient.scard = function(key, cb) {
 	handler.scard(key, function(err, res) {
		if (err !== null) {
			logger.error("exec scard failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.hmget = function(key, fields, cb) {
 	handler.hmget(key, fields, function(err, res) {
		if (err !== null) {
			logger.error("exec hmget failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.hgetall = function(key, cb) {
 	handler.hgetall(key, function(err, res) {
		if (err !== null) {
			logger.error("exec hgetall failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.expire = function(key, timeout, cb) {
	handler.expire(key, timeout, cb);
}

redisClient.hmset = function(key, fileds, vals, cb) {
	var args = [];
	for (var i = 0; i < fileds.length; ++i) {
		args.push(fileds[i]);
		args.push(vals[i]);
	}
 	handler.hmset(key, args, function(err, res) {
		if (err !== null) {
			logger.error("exec hmset failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.zrevrank = function(key, uid, cb) {
	handler.zrevrank(key, uid, function(err, res) {
		if (err !== null) {
			logger.error("exec zrank failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.zscore = function(key, uid, cb) {
	handler.zscore(key, uid, function(err, res) {
		if (err !== null) {
			logger.error("exec zscore failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.zrevrange = function(key, args, cb) {
    handler.zrevrange(key, uid, function(err, res) {
		if (err !== null) {
			logger.error("exec zrevrange failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.zadd = function(key, uid, score, cb) {
    handler.zrevrange(key, [uid, score], function(err, res) {
		if (err !== null) {
			logger.error("exec zadd failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}

redisClient.exists = function(key, cb) {
    handler.exists(key, function(err, res) {
		if (err !== null) {
			logger.error("exec exists failed");
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
}