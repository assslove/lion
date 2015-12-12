/**
 * @breif cache 管理器 如果在缓存里找不到，则直接查询数据库
 * Created by bin.hou on 2015/10/29.
 */

var path = require('path');
var ProtoBuf = require('protobufjs');
var async = require('async');

var utils = require('../../utils/utils.js');
var redis = require('../../utils/redis.js');
var logger = require('../../utils/log.js');
var CODE = require('../../utils/code.js');
var userDao = require('./../dao/userDao.js');
var itemDao = require('./../dao/itemDao.js');
var copyDao = require('./../dao/copyDao.js');
var petDao = require('./../dao/petDao.js');
var DEFINE = require('./../../proto/define.js');

var cacheManager = module.exports;

var builder = ProtoBuf.loadProtoFile(path.join(__dirname, "../../proto/usertype.proto"));
var Game = builder.build('game');

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

/* @brief 从缓存中获取用户，如果没有，则从数据库获取
 * @ cb 返回 err res
 * @ return res为用户信息
 */
cacheManager.getUser = function(app, uid, cb) {
    redis.hget(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.USER, function(err, res) {
        if (err == null && res == null) {
            userDao.getUser(app, uid, function(err, res) {
                if (err == null && res.length > 0) {
                    cacheManager.updateUser(app, uid, res[0], null);
                    utils.invokeCallback(cb, err, res[0]);
                } else {
                    utils.invokeCallback(cb, DEFINE.ERROR_CODE.USER_NOT_EXIST[0], null);
                }
            });
        } else {
            res = JSON.parse(res);
            utils.invokeCallback(cb, err, res);
        }
    });
}

/* @brief 更新用户
 */
cacheManager.updateUser = function(uid, user, cb) {
    redis.hset(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.USER, JSON.stringify(user), function(err, res) {
        if (err !== null) {
           logger.error("cache user failed [uid=%ld]", uid);
        }
        redis.expire(CODE.CACHE_KEY_TYPE.USER + uid, CODE.USER_EXPIRE, function() {});
        utils.invokeCallback(cb, err, res);
    });
}

/* @brief 获取物品
 */
cacheManager.getItem = function(app, uid, cb) {
    redis.hget(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.ITEM, function(err, res) {
        if (err == null && res == null) {
            itemDao.getItem(app, uid, function(err, res) {
                //delete the name
                var vals = [];
                for (var i in res) {
                    vals.push([res[i].itemid, res[i].count, res[i].expire]);
                }
                if (err == null) {
                    cacheManager.updateItem(uid, vals, function(err, result) {
                        utils.invokeCallback(cb, err, vals);
                    });
                } else {
                    utils.invokeCallback(cb, err, null);
                }
            });
        } else {
            res = JSON.parse(res);
            utils.invokeCallback(cb, err, res);
        }
    });
}

cacheManager.updateItem = function(uid, item, cb) {
    redis.hset(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.ITEM, JSON.stringify(item), function(err, res) {
        if (err !== null) {
           logger.error("cache item failed [uid=%ld]", uid);
        }
        utils.invokeCallback(cb, err, res);
    });
}

cacheManager.getCopy = function(app, uid, cb) {
    redis.hget(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.COPY, function(err, res) {
        if (err == null && res == null) {
            copyDao.getCopy(app, uid, function(err, res) {
                var vals = [];
                for (var i in res) {
                    vals.push([res[i].copyid, res[i].max_score, res[i].star]);
                }
                if (err == null) {
                    cacheManager.updateCopy(uid, vals, function(err, result){
                        utils.invokeCallback(cb, err, vals);
                    });
                }
            });
        } else {
            res = JSON.parse(res);
            utils.invokeCallback(cb, err, res);
        }
    });
}

cacheManager.updateCopy = function(uid, copy, cb) {
    redis.hset(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.COPY, JSON.stringify(copy), function(err, res) {
        if (err !== null) {
           logger.error("cache copy failed [uid=%ld]", uid);
        }
        utils.invokeCallback(cb, err, res);
    });
}

cacheManager.getUserInfo = function(app, uid, cb) {
    redis.hgetall(CODE.CACHE_TYPE.USER + uid, function(err, results) {
        for (var i in results) {
            if (i == CODE.CACHE_KEY_TYPE.PET) continue;
            results[i] = JSON.parse(results[i]);
        }
        cb(err, results);
    });
}

cacheManager.updateUserInfo = function(app, uid, res, cb) {
    var fields = [CODE.CACHE_KEY_TYPE.USER, CODE.CACHE_KEY_TYPE.ITEM, CODE.CACHE_KEY_TYPE.COPY];
    var vals = [res.user, res.item, res.copy];
    for (var i in vals) {
        vals[i] = JSON.stringify(vals[i]);
    }
    redis.hmset(CODE.CACHE_TYPE.USER + uid,
        fields,
        vals,
        function(err, result) {
           redis.expire(CODE.CACHE_TYPE.USER + uid, CODE.USER_EXPIRE, cb);
        }
    );
}

cacheManager.getPet = function(app, uid, cb) {
    redis.hget(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.PET, function(err, res) {
        if (err == null && res == null) {
            petDao.getPet(app, uid, function(err, res) {
                if (err == null && res.length != 0) {
                    cacheManager.updatePet(uid, res[0], function(err, result){
                        utils.invokeCallback(cb, err, res[0]);
                    });
                } else {
                    utils.invokeCallback(cb, err, null);
                }
            });
        } else {
            res = new Buffer(res);
            utils.invokeCallback(cb, err, res);
        }
    });
}

cacheManager.updatePet = function(uid, pet, cb) {
    redis.hset(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.PET, pet, function(err, res) {
        if (err !== null) {
           logger.error("cache pet failed [uid=%ld]", uid);
        }
        utils.invokeCallback(cb, err, res);
    });
}

cacheManager.serializeToPb = function(type, obj) {
    var model = new Game[type](obj);
    return model.encode().toBuffer();
}

cacheManager.parseFromPb = function(type, buffer) {
    return Game[type].decode(buffer);
}

cacheManager.getUserCopyScore =  function(copyid, ids, cb) {
    redis.hmget(CODE.CACHE_TYPE.COPY_SCORE + copyid, ids, function(err, res) {
        if (err !== null) {
            logger.error("get copy score failed");
        }
        utils.invokeCallback(cb, err, res);
    });
}

cacheManager.updateCopyScore = function(uid, cpy, cb) {
    var i = 0;
    var total = cpy.length;
    async.whilst(
        function() {return i < total;},
        function(callback) {
            var id = cpy[i][0];
            var score = cpy[i][1];
            redis.hset(CODE.CACHE_TYPE.COPY_SCORE + id, uid, score, function(err, results) {
                ++i;
                callback(err);
            })
        },
        function(err) {
           cb(err, null);
        }
    )
}

cacheManager.updateUserBase = function(uid, base, cb) {
    var obj = {
        uid : base.uid,
        name : base.name,
        head_icon : base.head_icon,
        max_copy : base.max_copy,
        copy_stars : base.copy_stars,
        use_pet : base.use_pet
    };

    redis.hset(CODE.CACHE_TYPE.USER_BASE, uid, JSON.stringify(obj), function(err, res) {
        if (err !== null) {
           logger.error("cache user base failed [uid=%ld]", uid);
        }
        utils.invokeCallback(cb, err, res);
    });
}

cacheManager.getUserBases = function(uids, cb) {
    redis.hmget(CODE.CACHE_TYPE.USER_BASE, uids, function(err, res) {
        if (err !== null) {
            logger.error("get user bases failed");
        }
        utils.invokeCallback(cb, err, res);
    });
}

cacheManager.updatePetParty = function(uid, petParty, cb) {
    var obj = {
        party_lv : petParty.party_lv,
        total_like : petParty.total_like
    };

    redis.hset(CODE.CACHE_TYPE.PET_PARTY, uid, JSON.stringify(obj), function(err, res) {
        if (err !== null) {
           logger.error("cache pet party failed [uid=%ld]", uid);
        }
        utils.invokeCallback(cb, err, res);
    });
}

cacheManager.getPetParty = function(uids, cb) {
    redis.hmget(CODE.CACHE_TYPE.PET_PARTY, uids, function(err, res) {
        if (err !== null) {
            logger.error("get pet party failed");
        }
        utils.invokeCallback(cb, err, res);
    });
}