/**
 * Created by houbin on 15-10-18.
 */
var async = require('async');

var DEFINE = require('./../../proto/define.js');
var logger = require("./../../utils/log.js");
var cacheManager = require("./../manager/cacheManager.js");
var CODE = require("./../../utils/code.js");
var utils = require('./../../utils/utils.js');
var protoManager = require('./../manager/protoManager.js');
var userDao = require('./../dao/userDao.js');
var accountDao = require('./../dao/accountDao.js');
var signDao = require('./../dao/signDao.js');
var userModel = require('./../model/user.js');
var async = require('async');

var confManager = require('./../manager/confManager.js');

var userController = module.exports;

/* @brief 用户登录
 */
userController.userLogin = function(protoid, pkg, req, res, cb) {
	pkg.uid = parseInt(pkg.uid);
    userModel.getUserInfo(req.app, pkg.uid, function(err, results) {
        if (err != null || results == null) {
            protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.USER_NOT_EXIST[0]);
        } else {
            logger.info("%d user login", pkg.uid);

			if (results.user == null || results.user == undefined) {
				protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.USER_NOT_EXIST[0]);
				return ;
			}

            if (utils.isDiffDay(results.user.last_login)) {
                userModel.initData(req.app, pkg.uid);
            }
            if (!utils.isSameWeek(results.user.last_login)) {
                userModel.initWeekData(req.app, pkg.uid);
            }

            //标记登录时间
            var user = results.user;
            user.last_login = utils.getCurTime();

            userModel.updateUser(req.app, user, function(err, results) {
                protoManager.sendErrorToUser(res, protoid, 0);
            });
        }
    });
}

/* @brief 用户登出
 */
userController.userLogout = function(protoid, pkg, req, res, cb) {
    cacheManager.delUser(pkg.uid, function(err, results) {
        logger.info("%d user logout", pkg.uid);
        protoManager.sendErrorToUser(res, protoid, 0);
    });
}

/* @brief 用户创建
 */
userController.userCreate = function(protoid, pkg, req, res, cb) {
    if (pkg.uid > CODE.MIN_UID) {
        logger.error("user create uid is error [uid=%d]", pkg.uid);
        return cb(DEFINE.ERROR_CODE.PROTO_DATA_INVALID[0]);
    }

    if (pkg.name == "" || pkg.name == null) {
        return cb(DEFINE.ERROR_CODE.USER_NICK_NULL[0]);
    }

    userModel.genUid(req.app, function(uid) {
        var user = {
            uid : uid,
            name : pkg.name,
            head_icon : 0,
            max_copy : 0,
            copy_stars : 0,
            cash : 0,
            gold : 0,
            hp : 0,
            last_login : 0,
            reg_time : utils.getCurTime()
        };

        var account = {
            uid : uid,
        };

        async.parallel([
            //function(callback) {
            //    //accountDao.addOrUpdateAccount(req.app, account, callback);
            //    callback(null, null);
            //},
            function(callback) {
                userDao.addUser(req.app, user, callback);
            },
            function(callback) {
                userModel.delUidFromCache(req.app, uid, callback);
            },
            function(callback) {
                userModel.addItem(req.app, uid, callback);
            },
            function(callback) {
                userModel.addCopy(req.app, uid, callback);
            },
            function(callback) {
                userModel.addFriendMail(req.app, uid, callback);
            },
            function(callback) {
                userModel.addFriend(req.app, uid, callback);
            },
            function(callback) {
                userModel.addPetParty(req.app, uid, callback);
            },
            function(callback) {
                userModel.addSign(req.app, uid, callback);
            },
            function(callback) {
                userModel.addMail(req.app, uid, callback);
            },
            function(callback) {
                cacheManager.updateUserBaseBaseInfo(uid, user, callback);
            },
            function(callback) {
                userModel.addLimit(req.app, uid, callback);
            }
        ], function(err, results) {
            if (err != null) return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.USER_EXIST[0]);

            var jsonObj = {
                uid : uid
            };

            logger.info("%d user create success", uid);
            protoManager.sendMsgToUser(res, protoid, jsonObj);
        });
    });
}


userController.userGetInfo = function(protoid, pkg, req, res, cb) {
    userModel.getUserInfo(req.app, pkg.uid, function(err, results) {
        if (err != null || err != undefined)  {
            return cb(DEFINE.ERROR_CODE.USER_DATA_ERROR[0]);
        }

        var obj = {
            user : results.user,
            item : [],
            copy : [],
            limit : [],
        };
        //去掉描述信息
        for (var i in results.item) {
            obj.item.push([results.item[i].itemid, results.item[i].count, results.item[i].expire]);
        }
        for (var i in results.copy) {
            obj.copy.push([results.copy[i].copyid, results.copy[i].max_score, results.copy[i].star]);
        }
        for (var i in results.limit) {
            obj.limit.push([results.limit[i].key, results.limit[i].value]);
        }

        protoManager.sendMsgToUser(res, protoid, obj);
    });
}

userController.userSyncInfo = function(protoid, pkg, req, res, cb) {
    cacheManager.getUser(req.app, pkg.uid, function(err, result) {
        if (err == null || res != null) {
            var user = result;
            //TODO check user info
            //var add = 0;
            //for (var i in pkg.cash_ext) {
            //    add += pkg.cash_ext[i];
            //}
            //
            //if (user.cash + add != pkg.cash) {
            //    return cb(DEFINE.ERROR_CODE.USER_DATA_ERROR[0]);
            //}

            if (pkg.name != user.name) { //更换昵称 脏词校验
                pkg.name = req.app.get("dirty").replaceDirty(pkg.name);
            }

            for (var i in pkg) {
                user[i] = pkg[i];
            }

            async.parallel([
                function(callback) {
                    cacheManager.updateUser(pkg.uid, user, callback);
                },
                function(callback) {
                    userDao.updateUser(req.app, user, callback);
                },
                function(callback) {
                    cacheManager.updateUserBaseBaseInfo(pkg.uid, user, callback);
                }
            ], function(err, results) {
                if (err != null || err != undefined) cb(DEFINE.ERROR_CODE.USER_SAVE_ERROR[0]);
                //protoManager.sendMsgToUser(res, protoid, user);
                cb(0);
            });
        } else {
            cb(DEFINE.ERROR_CODE.USER_NOT_EXIST[0]);
        }
    });
}

userController.userSyncTime = function(protoid, pkg, req, res, cb) {
    var obj = {
        timestamp : utils.getCurTime()
    };

    protoManager.sendMsgToUser(res, protoid, obj);
}

userController.getOtherUser = function(protoid, pkg, req, res, cb) {
    var uids = [pkg.other];
    cacheManager.getUserBases(uids, function(err, results) {
        if (err != null || results == null || results.length == 0)
            return cb(DEFINE.ERROR_CODE.USER_NOT_EXIST[0]);

        protoManager.sendMsgToUser(res, protoid, JSON.parse(results[0]));
    });

//    cacheManager.getUserBases(req.app, pkg.other, function(err, result) {
//        if (err != null) {
//            return cb(DEFINE.ERROR_CODE.USER_NOT_EXIST[0]);
//        }
//
//        protoManager.sendMsgToUser(res, protoid, result);
//    });
}

userController.getCopyRank = function(protoid, pkg, req, res, cb) {
    var copyid = pkg.copyid;
    var ids = pkg.friendid;
	ids.push(pkg.uid);
	if (ids.length == 0) {
        var ret = {
            copyid : copyid,
            friend : []
        };
        return protoManager.sendMsgToUser(res, protoid, ret);
	}
    cacheManager.getUserCopyScore(copyid, ids, function(err, results) {
        var copys = [];
        for (var i in ids) {
            if (results[i] == null) continue;
            var copy = [ids[i], parseInt(results[i])];
            copys.push(copy);
        }

        copys.sort(function(a, b) {
           return a[1] < b[1];
        });

//        var rank = 0;
//        for (var i in copys) {
//            if (copys[i][0] == pkg.uid) {
//                rank = parseInt(i) + 1;
//                break;
//            }
//        }

        copys.slice(0, 10);

        var ret = {
            copyid : copyid,
            friend : copys
        };
        protoManager.sendMsgToUser(res, protoid, ret);
    });
}

userController.userBind = function(protoid, pkg, req, res, cb) {
    var account = {
        uid : pkg.uid,
        channel : pkg.channel,
        channel_uid : pkg.channel_uid
    };

    accountDao.addOrUpdateAccount(req.app, account, function(err, results) {
        protoManager.sendErrorToUser(res, protoid, 0);
    });
}

userController.userUnbind = function(protoid, pkg, req, res, cb) {
    accountDao.delAccount(req.app, pkg.uid, function(err, results) {
        protoManager.sendErrorToUser(res, protoid, 0);
    });
}

userController.userGetSignInfo = function(protoid, pkg, req, res, cb) {
    var dayOfWeek = new Date().getDay();
    if (dayOfWeek == 0) dayOfWeek = 7;
    signDao.getSign(req.app, pkg.uid, function(err, results) {
        if (err != null || results.length == 0) {
            return cb(DEFINE.ERROR_CODE.SIGN_DATA_ERROR[0]);
        }

        var obj = results[0];
        //获取奖励
        var tmStr = req.app.get('server').server_time;
        var serv_tm = Math.floor(new Date(tmStr).getTime()/1000);
        var cur = Math.floor(new Date().getTime()/1000);
        var order = Math.floor((cur - serv_tm) / 604800) % 3;

        obj.item = confManager.getMarkDateReward(order);
        protoManager.sendMsgToUser(res, protoid, obj);
    });
}

userController.userSign = function(protoid, pkg, req, res, cb) {
    signDao.getSign(req.app, pkg.uid, function(err, results) {
        if (err != null || results.length == 0) {
            return cb(DEFINE.ERROR_CODE.SIGN_DATA_ERROR[0]);
        }

        var dayOfWeek = new Date().getDay();
        if (dayOfWeek == 0) dayOfWeek = 7;

        var obj = results[0];

        if (obj.sign_flag == 1) {
            if (obj.sign_day >= dayOfWeek) {
                return cb(DEFINE.ERROR_CODE.SIGN_ALREADY[0]);
            }
            obj.fill_check += 1;
            obj.sign_day += 1;
        } else {
            obj.sign_day += 1;
            obj.sign_flag = 1;
        }

        delete obj.uid;

        signDao.addOrUpdateSign(req.app, pkg.uid, obj, function(err, results) {
            protoManager.sendMsgToUser(res, protoid, obj);
        });
    });
}

userController.userLoginPlatform = function(protoid, pkg, req, res, cb) {
    switch(pkg.channel) {
        case DEFINE.CHANNEL.QIHU_360:
            userModel.login360(protoid, pkg, req, res, cb);
            break;
        default:
            cb(DEFINE.ERROR_CODE.CHANNEL_NOT_EXIST[0]);
    }
}
