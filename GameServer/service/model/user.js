/**
 * Created by bin.hou on 2015/10/21.
 */

var async = require('async');
var request = require('request');
var cacheManager = require('./../manager/cacheManager.js');
var protoManager = require('./../manager/protoManager.js');
var DEFINE = require('./../../proto/define.js');
var logger = require("./../../utils/log.js");
var uidDao = require('./../dao/uidDao.js');
var CODE = require('./../../utils/code.js');
var userDao = require('../dao/userDao.js');
var itemDao = require('../dao/itemDao.js');
var copyDao = require('../dao/copyDao.js');
var friendMailDao = require('./../dao/friendMailDao.js');
var friendDao = require('./../dao/friendDao.js');
var petPartyDao = require('./../dao/petPartyDao.js');
var signDao = require('./../dao/signDao.js');
var mailDao = require('./../dao/mailDao.js');
var utils = require("./../../utils/utils.js");
var accountDao = require('./../dao/accountDao.js');


var user = module.exports;

/* @brief 每次发现池里小于500个，则生成5000个账号账号
 */
user.genUid = function(app, cb) {
    async.waterfall([
        function(callback) {
            cacheManager.getUidCount(callback);
        },
        function(data, callback) {
            if (data < 500 ) {
                user.addUidToCache(app, function(err) {
                    cacheManager.randUid(callback);
                });
            } else {
                cacheManager.randUid(callback);
            }
        }
    ], function(err, results) {
        if (err != null) {
            logger.error("genenrate uid falied");
            cb(0);
        } else {
            cb(results);
        }
    });
}

/* @brief 增加5000个号到池里 并
 */
user.addUidToCache = function(app, cb) {
    uidDao.getMaxUid(app, function(err, results) {
        var start = CODE.MIN_UID + 1;
        if (results[0].uid != null) start = results[0].uid + 1;
        var end = start + 1000;

        var before_cb = cb;
        async.whilst(
            function() {return start < end;},
            function(callback) {
                async.parallel([
                    function(cb1) {
                        uidDao.insertOrUpdateUidFlag(app, start, 0, cb1);
                    },
                    function(cb1) {
                        cacheManager.addUid(start, cb1);
                    },
                ], function(err, results) {
                    ++start;
                    callback(err, results);
                });
            },
            function(err) {
                before_cb(err);
            }
        );
    });
}


user.delUidFromCache = function(app, uid, cb) {
    async.parallel([
        function(callback) {
            cacheManager.delUid(uid, callback);
        },
        function(callback) {
            uidDao.insertOrUpdateUidFlag(app, uid, 1, callback);
        }
    ], function(err, results) {
        cb(err, results);
    });
}

user.getUserInfo = function(app, uid, cb) {
    cacheManager.getUserInfo(app, uid, function(err, res) {
        if (err == null && res == null) {
            user.getUserInfoFromDB(app, uid, function(err, res) {
                if (err != null) {
                    utils.callback(cb, err, res);
                } else {
                    cacheManager.updateUserInfo(app, uid, res, function(err, result) {
                        cb(err, res);
                    });
                }
            });
        } else {
            var results = {
                user : res[CODE.CACHE_KEY_TYPE.USER],
                item : res[CODE.CACHE_KEY_TYPE.ITEM],
                copy : res[CODE.CACHE_KEY_TYPE.COPY]
            };
            cb(err, results);
        }
    })
}

user.getUserInfoFromDB = function(app, uid, cb) {
    async.series([
        function(callback) {
            userDao.getUser(app, uid, callback);
        },
        function(callback) {
            itemDao.getItem(app, uid, callback);
        },
        function(callback) {
            copyDao.getCopy(app, uid, callback);
        }
    ], function(err, results) {
        var items = cacheManager.parseFromPb("ItemList", results[1][0].info).item;
        var copys = cacheManager.parseFromPb("CopyList", results[2][0].info).copy;
        //var items=[], copys = [];
        //for (var i in tmpItems) {
        //    var item = tmpItems[i];
        //    items.push([item.itemid, item.count, item.expire]);
        //}
        //
        //var tmpCopys = cacheManager.parseFromPb("CopyList", results[2][0].info).copy;
        //for (var i in tmpCopys) {
        //    var copy = tmpCopys[i];
        //    copys.push([copy.copyid, copy.max_score, copy.star]);
        //}
        cb(err, {
            "user" : results[0] != null && results[0].length != 0 ? results[0][0]  : null,
            "item" : items,
            "copy" : copys
        });
    });
}


user.updateUser = function(app, user, cb) {
    async.parallel([
        function(callback) {
            userDao.updateUser(app, user, function(err, results) {
                callback(err, results);
            });
        },
        function(callback) {
            cacheManager.updateUser(user.uid, user, function(err, results) {
               callback(err, results);
            });
        }
    ], function(err, results) {
       cb(err, results);
    })
}

user.addFriendMail = function(app, uid, cb) {
    var obj = {
        mail : []
    };

    var buffer = cacheManager.serializeToPb("FriendMailList", obj);
    var friendMail = {
        mails : buffer,
        get_hp_times : 0,
        get_gold_times : 0,
        friendid : ""
    };

    friendMailDao.addOrUpdateFriendMail(app, uid, friendMail, function(err, results) {
        cb(err, results);
    });
}

user.addFriend = function(app, uid, cb) {
    var obj = {
        uid : []
    };

    var buffer = cacheManager.serializeToPb("FriendList", obj);
    var friend = {
        friendlist : buffer
    };

    friendDao.addOrUpdateFriend(app, uid, friend, function(err, results) {
        cb(err, results);
    });
}

/* @brief 每日数据清除
 */
user.initData = function(app, uid) {
    async.parallel([
        function(callback) {
            friendMailDao.initData(app, uid, callback);
        },
        function(callback) {
            user.initPetParty(app, uid, callback);
        },
        function(callback) {
            user.initSign(app, uid, callback);
        },
    ], function(err, results) {
        logger.info("init every date date [uid=%d]", uid);
    });
}

user.initWeekData = function(app, uid) {
    async.parallel([
        function(callback) {
            user.initWeekSign(app, uid, callback);
        },
    ], function(err, results) {
        logger.info("init every week data [uid=%ld]", uid);
    });
}
user.addPetParty = function(app, uid, cb) {
    var obj = {
        melike : [],
        likeme : [],
        party_lv : 1,
        total_like : 0,
        gift : [],
        gift_num : 0
    };
    async.parallel([
        function(callback) {
            var buffer = cacheManager.serializeToPb("PetParty", obj);
            var petParty = {
                info : buffer
            };
            petPartyDao.addOrUpdatePetParty(app, uid, petParty, function(err, results) {
                callback(err, results);
            });
        },
        function(callback) {
            cacheManager.updatePetParty(uid, obj, function(err, results) {
                callback(err, results);
            });
        }
    ], function(err, results) {
        cb(err, results);
    })

}

user.initPetParty = function(app, uid, callback) {
  petPartyDao.getPetParty(app, uid, function(err, results) {
      var petParty = cacheManager.parseFromPb("PetParty", results[0].info);
      petParty.gift_num = 0;
      petParty.likeme = [];
      petParty.melike = [];

      var buffer = cacheManager.serializeToPb("PetParty", petParty);

      petPartyDao.addOrUpdatePetParty(app, uid, {info : buffer}, callback);
  });
}

user.addSign = function(app, uid, callback) {
    var obj = {
        sign_day : 0,
        sign_flag : 0,
        fill_check : 0
    };

    signDao.addOrUpdateSign(app, uid, obj, function(err, results) {
        callback(err, results);
    });
}

user.initSign = function(app, uid, callback) {
    var obj = {
        sign_flag : 0,
        fill_check : 0
    };

    signDao.addOrUpdateSign(app, uid, obj, function(err, results) {
        callback(err, results);
    });
}

user.initWeekSign = function(app, uid, callback) {
    var obj = {
        sign_day : 0
    };

    signDao.addOrUpdateSign(app, uid, obj, function(err, results) {
        callback(err, results);
    });
}

user.addItem = function(app, uid, callback) {
    var obj = {
        item :[]
    };
    var buffer = cacheManager.serializeToPb("ItemList", obj);
    itemDao.addOrUpdateItem(app, uid, {info: buffer}, callback);
}

user.addCopy = function(app, uid, callback) {
    var obj = {
        copy :[]
    };
    var buffer = cacheManager.serializeToPb("CopyList", obj);
    copyDao.addOrUpdateCopy(app, uid, {info: buffer}, callback);
}

user.addMail = function(app, uid, cb) {
    var obj = {
        mail : []
    };

    var buffer = cacheManager.serializeToPb("SysMailList", obj);
    var mail = {
        info : buffer,
        check_tm: utils.getCurTime()
    };

    mailDao.addOrUpdateMail(app, uid, mail, function(err, results) {
        cb(err, results);
    });
}


/*
 * 360登录
 */
user.login360 = function(protoid, pkg, req, res, cb) {
    var url = "https://openapi.360.cn/user/me";
    var params = JSON.parse(pkg.msg);

    request.get(url, {
        form : params
    }, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var id = body.id;
            accountDao.getUidByChannel(req.app, pkg.channel, id, function(err, results) {
                if (err) return cb(DEFINE.ERROR_CODE.DB_ERROR[0]);

                var obj = {};
                obj.msg = JSON.stringify(body);
                if (results.length == 0) {
                    obj.uid = 0;
                } else {
                    obj.uid = results[0].uid
                }

                protoManager.sendMsgToUser(res, protoid, obj);
            });
        } else {
            logger.error(body.error);
            cb(DEFINE.ERROR_CODE.LOGIN_PLATFORM_FAIL[0]);
        }
    });
}
