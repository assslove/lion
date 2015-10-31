/**
 * @breif cache 管理器 如果在缓存里找不到，则直接查询数据库
 * Created by bin.hou on 2015/10/29.
 */

var utils = require('../../utils/utils.js');
var redis = require('../../utils/redis.js');
var logger = require('../../utils/log.js');
var CODE = require('../../utils/code.js');
var userDao = require('./../dao/userDao.js');

var cacheManager = module.exports;

/* @brief 从缓存中获取用户，如果没有，则从数据库获取
 * @ cb 返回 err res
 * @ return res为用户信息
 */
cacheManager.getUser = function(app, uid, cb) {
    redis.hget(app, CODE.CACHE_TYPE.USER, uid, function(err, res) {
        if (err !== null) {
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
cacheManager.updateUser = function(app, uid, user, cb) {
    redis.hset(app, CODE.CACHE_TYPE.USER, uid, user, function(err, res) {
        if (err !== null) {
           logger.error("cache user failed [uid=%ld]", uid);
        }
        utils.invokeCallback(cb, err, res);
    });
}

/* @brief 增加用户id
 */
cacheManager.addUid = function(app, uid, cb) {
    redis.sadd(app, CODE.CACHE_TYPE.USERID, uid, function(err, res) {
        utils.invokeCallback(cb, err, res);
    });
}

/* @brief 删除用户id
 */
cacheManager.delUid = function(app, uid, cb) {
    redis.srem(app, code.CACHE_TYPE.USERID, uid, function(err, res) {
        utils.invokeCallback(cb, err, res);
    });
}

/* @brief 随机一个用户id
 */
cacheManager.randUid = function(app, cb) {
    redis.srandmember(app, code.CACHE_TYPE.USERID, function(err, res) {
        utils.invokeCallback(cb, err, res);
    });
}

