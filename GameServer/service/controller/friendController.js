/**
 * @brief 好友控制器
 * Created by houbin on 15-11-14.
 */
var async = require('async');

var DEFINE = require('./../../proto/define.js');
var logger = require("./../../utils/log.js");
var CODE = require("./../../utils/code.js");
var utils = require('./../../utils/utils.js');

var protoManager = require('./../manager/protoManager.js');
var cacheManager = require("./../manager/cacheManager.js");
var friendDao = require('./../dao/friendDao.js');
var friendMailDao = require('./../dao/friendMailDao.js');

var friendController = module.exports;

friendController.friendAdd = function(protoid, pkg, req, res, cb) {
    //检查是否申请过,
    var friendId = pkg.friendid;

    if (friendId == pkg.uid) {
        return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.PROTO_DATA_INVALID[0]);
    }

    friendMailDao.getFriendMail(req.app, friendId, function(err, results) {
        if (err != null) {
            return cb(DEFINE.ERROR_CODE.SERV_ERROR[0]);
        }

        if (results.length == 0) {
            return cb(DEFINE.ERROR_CODE.FRIEND_NOT_FOUND[0]);
        }

        var mails = cacheManager.parseFromPb("FriendMailList", results[0].mails);
        var mail = {
            uid : parseInt(pkg.uid),
            type : CODE.FRIEND_MAIL_TYPE.APPLY
        };

        mails.mail.push(mail);

        var newMails = cacheManager.serializeToPb("FriendMailList", mails);

        var obj = {
            mails : newMails
        };

        friendMailDao.addOrUpdateFriendMail(req.app, friendId, obj, function(err, results) {
            protoManager.sendErrorToUser(res, protoid, 0);
        });
    });
}

friendController.friendDel = function(protoid, pkg, req, res, cb) {
    var uids = pkg.friendid;
    async.parallel([
        function(callback) { //从自己列表中删除
            friendDao.getFriend(req.app, pkg.uid, function(err, results) {
                var friends = cacheManager.parseFromPb("FriendList", results[0].friendlist).uid;
                for (var i in uids) {
                    for (var j in friends) {
                        if (friends[j] == uids[i]) {
                            friends.splice(j, 1);
                            break;
                        }
                    }
                }

                var buffer = cacheManager.serializeToPb("FriendList", {uid: friends});
                friendDao.addOrUpdateFriend(req.app, pkg.uid, {friendlist: buffer}, function(err, results) {
                    callback(err, results);
                });
            });

        },
        function(callback) { //把自己从别人列表中删除
            var i = 0, total = uids.length;
            async.whilst(
                function() {return i < total;},
                function(callback1) {
                    var friendid = uids[i];
                    friendDao.getFriend(req.app, friendid, function(err, results) {
                        var friends = cacheManager.parseFromPb("FriendList", results[0].friendlist).uid;
                        for (var j in friends) {
                            if (friends[j] == pkg.uid) {
                                friends.splice(j, 1);
                                break;
                            }
                        }
                        var buffer = cacheManager.serializeToPb("FriendList", {uid: friends});
                        friendDao.addOrUpdateFriend(req.app, friendid, {friendlist: buffer}, function(err, results) {
                            ++i;
                            callback1(err);
                        });
                    });
                },
                function(err) {
                    callback(err, null);
                }
            );
        }
    ], function(err, results) {
        protoManager.sendErrorToUser(res, protoid, 0);
    });
}

friendController.getFriends  = function(protoid, pkg, req, res, cb) {
    friendDao.getFriend(req.app, pkg.uid, function(err, results) {
        if (err != null || results.length == 0) return cb(DEFINE.ERROR_CODE.SERV_ERROR[0]);

        var uids = cacheManager.parseFromPb("FriendList", results[0].friendlist).uid;

        cacheManager.getUserBases(uids, function(err, results) {
            var users = [];
            for (var i in results) {
                users.push(JSON.parse(results[i]));
            }

            protoManager.sendMsgToUser(res, protoid, { user: users});
        });
    });
}

friendController.getFriendMail = function(protoid, pkg, req, res, cb) {
    friendMailDao.getFriendMail(req.app, pkg.uid, function(err, results) {
        if (err != null) return cb(DEFINE.ERROR_CODE.SERV_ERROR[0]);

        var mails = cacheManager.parseFromPb("FriendMailList", results[0].mails);
        var uids = [];
        for (var i in mails.mail) {
            uids.push(mails.mail[i].uid);
        }

        var ret = {
            get_hp_times : results[0].get_hp_times,
            get_gold_times : results[0].get_gold_times
        };
        cacheManager.getUserBases(uids, function(err, results) {
            var list = [];
            for (var i in results) {
                var user = JSON.parse(results[i]);
                var obj = {
                    user : user,
                    type : mails.mail[i].type
                };
                list.push(obj);
            }


            ret.mail = list;
            protoManager.sendMsgToUser(res, protoid, ret);
        });
    });
}

friendController.readFriendMail  = function(protoid, pkg, req, res, cb) {
    var type = pkg.type, friendId = pkg.friendid, answer = pkg.answer;
    friendMailDao.getFriendMail(req.app, pkg.uid, function (err, results) {
        var mails = cacheManager.parseFromPb("FriendMailList", results[0].mails).mail;
        var ids = [];
        if (friendId == 0) { //读取所有好友邮件
            for (var i in mails) {
                if (mails[i].type == type) ids.push(i);
            }
        } else {
            for (var i in mails) {
                if (mails[i].type == type && mails[i].uid == friendId) ids.push(i);
            }
        }

        if (ids.length == 0) return cb(DEFINE.ERROR_CODE.FRIEND_MAIL_NOT_FOUND[0]);

        switch(type) {
            case CODE.FRIEND_MAIL_TYPE.APPLY:
                handleFriendApply(mails, ids, req, protoid, pkg, res);
                break;
            case CODE.FRIEND_MAIL_TYPE.GET_HP:
                handleFriendGetHp(mails, ids, req, protoid, pkg, res);
                break;
            case CODE.FRIEND_MAIL_TYPE.GIVE_HP:
            {
                var total_times = results[0].get_hp_times + ids.length;
                if (total_times > 20) {
                    ids = ids.slice(0, total_times - 20);
                    total_times = 20;
                }
                if (ids.length == 0) return cb(DEFINE.ERROR_CODE.REWARD_DAY_LIMIT[0]);
                handleFriendGiveHp(mails, ids, total_times, req, protoid, pkg, res);
                break;
            }
            case CODE.FRIEND_MAIL_TYPE.GIVE_GOLD:
            {
                var total_times = results[0].get_gold_times + ids.length;
                if (total_times > 20) {
                    ids = ids.slice(0, total_times - 20);
                    total_times = 20;
                }
                if (ids.length == 0) return cb(DEFINE.ERROR_CODE.REWARD_DAY_LIMIT[0]);
                handleFriendGiveGold(mails, ids, total_times, req, protoid, pkg, res);
                break;
            }
        }

    });
}

friendController.requestHp = function(protoid, pkg, req, res, cb) {
    var uids = pkg.friendid;
    var i = 0, total = uids.length;
    for (var i in uids) {
        if (uids[i] == pkg.uid) {
            return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.PROTO_DATA_INVALID[0]);
        }
    }

    async.whilst(
        function() {return i < total;},
        function(callback) {
            friendMailDao.getFriendMail(req.app, uids[i], function(err, results) {
                var mails = cacheManager.parseFromPb("FriendMailList", results[0].mails).mail;
                for (var j in mails) {
                    if (mails[j].type == CODE.FRIEND_MAIL_TYPE.GET_HP && mails[j].uid == pkg.uid) { //已经申请过
                        ++i;
                        return callback(null);
                    }
                }

                mails.push({type : CODE.FRIEND_MAIL_TYPE.GET_HP, uid : parseInt(pkg.uid)});

                var buffer = cacheManager.serializeToPb("FriendMailList", {mail : mails});
                friendMailDao.addOrUpdateFriendMail(req.app, uids[i], {mails : buffer}, function(err, results) {
                    ++i;
                    callback(err);
                });
            });
        },
        function(err) {
            protoManager.sendErrorToUser(res, protoid, 0);
        }
    );
}

/* @brief 公共函数定义
 */
function handleFriendApply(mails, ids, req, protoid, pkg, res) {
    var friendMail = {};
    if (pkg.answer == 1) {
        var uids = [];
        for (var i in ids) {
            uids.push(mails[ids[i]].uid);
        }

        async.parallel([
            function(callback) { // 增加好友到自己列表中
                friendDao.getFriend(req.app, pkg.uid, function(err, results) {
                    var friends = cacheManager.parseFromPb("FriendList", results[0].friendlist).uid;
                    for (var i in uids) {
                        var isFind = false;
                        for (var j in friends) {
                            if (friends[j] == uids[i]) {
                                isFind = true;
                                break;
                            }
                        }

                        if (!isFind) friends.push(uids[i]);
                    }

                    var buffer = cacheManager.serializeToPb("FriendList", {uid : friends});
                    friendDao.addOrUpdateFriend(req.app, pkg.uid, {friendlist : buffer}, function(err, results) {
                        callback(err, results);
                    });
                });
            },
            function(callback) { // 增加自己到其它好友中
                var i = 0,  total = uids.length;
                async.whilst(
                    function() { return i < total; },
                    function(callback1) {
                        addFriend(req, uids[i], pkg.uid, function(err, results) {
                            ++i;
                            callback1(err, results);
                        });
                    },
                    function(err) {
                        callback(err, null);
                    }
                )
            }
        ], function(err, results) {
            delFriendMail(mails, ids, friendMail);
            saveFriendMail(friendMail, protoid, pkg, req, res);
        });
    } else { //删除邮件
        delFriendMail(mails, ids, friendMail);
        saveFriendMail(friendMail, protoid, pkg, req, res);
    }


}
friendController.giveGold = function(protoid, pkg, req, res, cb) {
    var friendid  = pkg.friendid;
    if (friendid == pkg.uid) {
        return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.PROTO_DATA_INVALID[0]);
    }

    friendMailDao.getFriendMail(req.app, friendid, function(err, results) {
        var mails = cacheManager.parseFromPb("FriendMailList", results[0].mails).mail;
        for (var j in mails) {
            if (mails[j].type == CODE.FRIEND_MAIL_TYPE.GIVE_GOLD && mails[j].uid == pkg.uid) { //已经赠送
                return cb(0);
            }
        }

        mails.push({type: CODE.FRIEND_MAIL_TYPE.GIVE_GOLD, uid: parseInt(pkg.uid)});

        var buffer = cacheManager.serializeToPb("FriendMailList", {mail: mails});
        friendMailDao.addOrUpdateFriendMail(req.app, friendid, {mails: buffer}, function (err, results) {
            protoManager.sendErrorToUser(res, protoid, 0);
        });
    });
}

function delFriendMail(mails, ids, friendMail)
{
    for (var i in ids) {
        mails.splice(ids[i], 1);
    }

    var buffer = cacheManager.serializeToPb("FriendMailList", {mail : mails});
    friendMail.mails = buffer;
}

function saveFriendMail(friendMail, protoid, pkg, req, res) {
    friendMailDao.addOrUpdateFriendMail(req.app, pkg.uid, friendMail, function(err, results) {
        protoManager.sendErrorToUser(res, protoid, 0);
    });
}

/* @brief 增加friendid到uid中
 * @param friendid 好友id
 */
function addFriend(req, uid, friendid, cb) {
    friendDao.getFriend(req.app, uid, function(err, results) {
        var friends = cacheManager.parseFromPb("FriendList", results[0].friendlist).uid;
        var isFind = false;
        for (var j in friends) {
            if (friends[j] == friendid) {
                isFind = true;
                break;
            }
        }

        if (!isFind) {
            friends.push(parseInt(friendid));
            var buffer = cacheManager.serializeToPb("FriendList", {uid : friends});
            friendDao.addOrUpdateFriend(req.app, uid, {friendlist : buffer}, function(err, results) {
                utils.invokeCallback(cb, err, results);
            });
        } else {
           utils.invokeCallback(cb, null, null);
        }
    });
}

function handleFriendGetHp(mails, ids, req, protoid, pkg, res)
{
    var friendMail = {};
    if (pkg.answer == 1) {
        var uids = [];
        for (var i in ids) {
            uids.push(mails[ids[i]].uid);
        }

        var i = 0,  total = uids.length;
        async.whilst(
            function() { return i < total; },
            function(callback) { //增加到好友邮件中
                friendMailDao.getFriendMail(req.app, uids[i], function(err, results) {
                    var mails = cacheManager.parseFromPb("FriendMailList", results[0].mails).mail;
                    mails.push({uid : parseInt(pkg.uid), type : CODE.FRIEND_MAIL_TYPE.GIVE_HP});
                    var buffer = cacheManager.serializeToPb("FriendMailList", {mail : mails});
                    friendMailDao.addOrUpdateFriendMail(req.app, uids[i], {mails : buffer}, function(err, results) {
                        ++i;
                        callback(err);
                    });
                });
            },
            function(err) {
                delFriendMail(mails, ids, friendMail);
                saveFriendMail(friendMail, protoid, pkg, req, res);
            }
        );
    } else { //删除邮件
        delFriendMail(mails, ids, friendMail);
        saveFriendMail(friendMail, protoid, pkg, req, res);
    }
}

/* @brief 领取赠送体力
 */
function handleFriendGiveHp(mails, ids, total_times, req, protoid, pkg, res)
{
    var friendMail = {};
    if (pkg.answer == 1) {
        var uids = [];
        for (var i in ids) {
            uids.push(mails[ids[i]].uid);
        }

        friendMail.get_hp_times = total_times;
        delFriendMail(mails, ids, friendMail);
        saveFriendMail(friendMail, protoid, pkg, req, res);
    } else { //删除邮件
        delFriendMail(mails, ids, friendMail);
        saveFriendMail(friendMail, protoid, pkg, req, res);
    }
}

/* @brief 赠送金币
 */
function handleFriendGiveGold(mails, ids, total_times, req, protoid, pkg, res)
{
    var friendMail = {};
    if (pkg.answer == 1) {
        var uids = [];
        for (var i in ids) {
            uids.push(mails[ids[i]].uid);
        }

        friendMail.get_gold_times = total_times;
        delFriendMail(mails, ids, friendMail);
        saveFriendMail(friendMail, protoid, pkg, req, res);
    } else { //删除邮件
        delFriendMail(mails, ids, friendMail);
        saveFriendMail(friendMail, protoid, pkg, req, res);
    }
}
