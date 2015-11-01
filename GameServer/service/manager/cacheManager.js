/**
 * @breif cache 管理器 如果在缓存里找不到，则直接查询数据库
 * Created by bin.hou on 2015/10/29.
 */

var utils = require('../../utils/utils.js');
var redis = require('../../utils/redis.js');
var logger = require('../../utils/log.js');
var CODE = require('../../utils/code.js');
var userDao = require('./../dao/userDao.js');
var itemDao = require('./../dao/itemDao.js');
var copyDao = require('./../dao/copyDao.js');

var cacheManager = module.exports;

/* @brief 从缓存中获取用户，如果没有，则从数据库获取
 * @ cb 返回 err res
 * @ return res为用户信息
 */
cacheManager.getUser = function(app, uid, cb) {
    redis.hget(CODE.CACHE_TYPE.USER, uid, function(err, res) {
        if (err == null && res == null) {
            userDao.getUser(app, uid, function(err, res) {
                if (res.length > 0) cacheManager.updateUser(app, uid, res[0], null);
                cb(err, res);
            });
        } else {
            cb(err, res);
        }
    });
}

/* @brief 更新用户
 */
cacheManager.updateUser = function(uid, user, cb) {
    redis.hset(CODE.CACHE_TYPE.USER, uid, user, function(err, res) {
        if (err !== null) {
           logger.error("cache user failed [uid=%ld]", uid);
        }
        utils.invokeCallback(cb, err, res);
    });
}

/* @brief 增加用户id
 */
cacheManager.addUid = function(uid, cb) {
    redis.sadd(CODE.CACHE_TYPE.USERID, uid, function(err, res) {
        utils.invokeCallback(cb, err, res);
    });
}

/* @brief 删除用户id
 */
cacheManager.delUid = function(uid, cb) {
    redis.srem(CODE.CACHE_TYPE.USERID, uid, function(err, res) {
        utils.invokeCallback(cb, err, res);
    });
}

/* @brief 随机一个用户id
 */
cacheManager.randUid = function(cb) {
    redis.srandmember(CODE.CACHE_TYPE.USERID, function(err, res) {
        utils.invokeCallback(cb, err, res);
    });
}

/* @brief 获取用户id数量
 */
cacheManager.getUidCount = function(cb) {
    redis.scard(CODE.CACHE_TYPE.USERID, function(err, res) {
        utils.invokeCallback(cb, err, res);
    });
}

/* @brief 获取物品
 */
cacheManager.getItem = function(app, uid, cb) {
    redis.hget(CODE.CACHE_TYPE.ITEM, uid, function(err, res) {
        if (err == null && res == null) {
            itemDao.getItem(app, uid, function(err, res) {
                if (res.length > 0) cacheManager.updateItem(app, uid, res[0], null);
                cb(err, res);
            });
        } else {
            cb(err, res);
        }
    });
}

cacheManager.updateItem = function(uid, item, cb) {
    redis.hset(CODE.CACHE_TYPE.ITEM, uid, item, function(err, res) {
        if (err !== null) {
           logger.error("cache item failed [uid=%ld]", uid);
        }
        utils.invokeCallback(cb, err, res);
    });
}

cacheManager.getCopy = function(app, uid, cb) {
    redis.hget(CODE.CACHE_TYPE.COPY, uid, function(err, res) {
        if (err == null && res == null) {
            copyDao.getCopy(app, uid, function(err, res) {
                if (res.length > 0) cacheManager.updateCopy(app, uid, res, null);
                cb(err, res);
            });
        } else {
            cb(err, res);
        }
    });
}

cacheManager.updateCopy = function(uid, copy, cb) {
    redis.hset(CODE.CACHE_TYPE.COPY, uid, copy, function(err, res) {
        if (err !== null) {
           logger.error("cache copy failed [uid=%ld]", uid);
        }
        utils.invokeCallback(cb, err, res);
    });
}
