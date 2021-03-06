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
var limitDao = require('./../dao/limitDao.js');
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
    async.parallel([
        function(callback) {
            redis.hset(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.USER, JSON.stringify(user), callback);
        },
        function(callback) {
            redis.expire(CODE.CACHE_TYPE.USER + uid, CODE.USER_EXPIRE, callback);
        }
    ], function(err, results) {
        if (err !== null) {
            logger.error("cache user failed [uid=%ld]", uid);
        }
        utils.invokeCallback(cb, err, null);
    })
}

/* @brief 获取物品
 */
cacheManager.getItem = function(app, uid, cb) {
    redis.hget(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.ITEM, function(err, res) {
        if (err == null && res == null) {
            itemDao.getItem(app, uid, function(err, res) {
                if (err == null) {
                    cacheManager.updateItem(uid, res[0].info, function(err, result) {
                        var items = cacheManager.parseFromPb("ItemList", res[0].info).item;
                        utils.invokeCallback(cb, err, items);
                    });
                } else {
                    utils.invokeCallback(cb, err, null);
                }
            });
        } else {
            var items = cacheManager.parseFromPb("ItemList", new Buffer(res, 'binary')).item;
            utils.invokeCallback(cb, err, items);
        }
    });
}

cacheManager.updateItem = function(uid, item, cb) {
    redis.hset(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.ITEM, item.toString('binary'), function(err, res) {
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
                if (err == null) {
                    cacheManager.updateCopy(uid, res[0].info, function(err, result){
                        var copys = cacheManager.parseFromPb("CopyList", res[0].info).copy;
                        utils.invokeCallback(cb, err, copys);
                    });
                } else {
                    utils.invokeCallback(cb, err, []);
                }
            });
        } else {
            var copys = cacheManager.parseFromPb("CopyList", new Buffer(res, 'binary')).copy;
            utils.invokeCallback(cb, err, copys);
        }
    });
}

cacheManager.updateCopy = function(uid, copy, cb) {
    redis.hset(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.COPY, copy.toString('binary'), function(err, res) {
        if (err !== null) {
           logger.error("cache copy failed [uid=%ld]", uid);
        }
        utils.invokeCallback(cb, err, res);
    });
}

cacheManager.getLimit = function(app, uid, cb) {
    redis.hget(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.LIMIT, function(err, res) {
        if (err == null && res == null) {
            limitDao.getLimit(app, uid, function(err, res) {
                if (err == null) {
                    cacheManager.updateLimit(uid, res[0].info, function(err, result){
                        var limits = cacheManager.parseFromPb("LimitList", res[0].info).limit;
                        utils.invokeCallback(cb, err, limits);
                    });
                } else {
                    utils.invokeCallback(cb, err, []);
                }
            });
        } else {
            var limits = cacheManager.parseFromPb("LimitList", new Buffer(res, 'binary')).limit;
            utils.invokeCallback(cb, err, limits);
        }
    });
}

cacheManager.updateLimit = function(uid, limit, cb) {
    redis.hset(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.LIMIT, limit.toString('binary'), function(err, res) {
        if (err !== null) {
           logger.error("cache limit failed [uid=%ld]", uid);
        }
        utils.invokeCallback(cb, err, res);
    });
}

cacheManager.getUserInfo = function(app, uid, cb) {
    redis.hgetall(CODE.CACHE_TYPE.USER + uid, function(err, results) {
        for (var i in results) {
            switch (i) {
                case CODE.CACHE_KEY_TYPE.USER:
                    results[i] = JSON.parse(results[i]);
                    break;
                case CODE.CACHE_KEY_TYPE.ITEM:
                    results[i] = cacheManager.parseFromPb("ItemList",
                        new Buffer(results[i], "binary").slice(0, results[i].length)).item;
                    break;
                case CODE.CACHE_KEY_TYPE.COPY:
                    results[i] = cacheManager.parseFromPb("CopyList",
                        new Buffer(results[i], "binary").slice(0, results[i].length)).copy;
                    break;
                case CODE.CACHE_KEY_TYPE.LIMIT:
                    results[i] = cacheManager.parseFromPb("LimitList",
                        new Buffer(results[i], "binary").slice(0, results[i].length)).limit;
                    break;
                default:
                    break;
            }
        }
        cb(err, results);
    });
}

cacheManager.updateUserInfo = function(app, uid, res, cb) {
    var fields = [CODE.CACHE_KEY_TYPE.USER, CODE.CACHE_KEY_TYPE.ITEM, CODE.CACHE_KEY_TYPE.COPY];
    var vals = [res.user, res.item, res.copy];
    for (var i in fields) {
        switch (fields[i]) {
            case CODE.CACHE_KEY_TYPE.ITEM:
                vals[i] = cacheManager.serializeToPb("ItemList", {item : vals[i]}).toString('binary');
                break;
            case CODE.CACHE_KEY_TYPE.COPY:
                vals[i] = cacheManager.serializeToPb("CopyList", {copy : vals[i]}).toString('binary');
                break;
            default:
                vals[i] = JSON.stringify(vals[i]);
                break;
        }
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
                    cacheManager.updatePet(uid, res[0].pet, function(err, result){
                        utils.invokeCallback(cb, err, res[0].pet);
                    });
                } else {
                    utils.invokeCallback(cb, err, null);
                }
            });
        } else {
            res = new Buffer(res, 'binary').slice(0, res.length);
            utils.invokeCallback(cb, err, res);
        }
    });
}

cacheManager.updatePet = function(uid, pet, cb) {
    redis.hset(CODE.CACHE_TYPE.USER + uid, CODE.CACHE_KEY_TYPE.PET, pet.toString('binary'), function(err, res) {
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

cacheManager.updateUserBase = function(uid, obj, cb) {
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

cacheManager.getUserBase = function(uid, cb) {
    redis.hget(CODE.CACHE_TYPE.USER_BASE, uid, function(err, res) {
        if (err !== null) {
            logger.error("get user base failed");
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
cacheManager.checkUser = function(key, cb) {
    redis.exists(CODE.CACHE_TYPE.USER + key, function(err, res) {
        if (err !== null) {
            logger.error("check user failed");
        }
        utils.invokeCallback(cb, err, res);
    });
}

cacheManager.updateTotalLike = function(uid, total_like, cb) {
    cacheManager.getUserBase(uid, function(err, result) {
        if (result == null) return cb(err, result);
        result = JSON.parse(result);
        result.total_like = total_like;
        cacheManager.updateUserBase(uid, result, cb);
    });
}

cacheManager.updateUserBaseBaseInfo = function(uid, base, cb) {
    cacheManager.getUserBase(uid, function(err, result) {
        var obj = {
            uid : base.uid,
            name : base.name,
            head_icon : base.head_icon,
            max_copy : base.max_copy,
            copy_stars : base.copy_stars,
            use_pet : base.use_pet,
            total_like : 0
        };
        if (result != null) {
            result = JSON.parse(result);
            //其它数据
            obj.total_like = result.total_like;
        }

        cacheManager.updateUserBase(uid, obj, cb);
    });
}

cacheManager.delUser = function(uid, cb) {
    redis.del(CODE.CACHE_TYPE.USER + uid, cb);
}
