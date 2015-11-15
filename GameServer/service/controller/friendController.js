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

}

friendController.getFriends  = function(protoid, pkg, req, res, cb) {
    friendDao.getFriend(req.app, pkg.uid, function(err, results) {
        if (err != null || results.length == 0) return cb(DEFINE.ERROR_CODE.SERV_ERROR[0]);

        var uids = cacheManager.parseFromPb("FriendList", results[0].friendlist).uid;

        var i = 0, total = uids.length;
        var users = [];
        async.whilst(
            function() {return i < total; },
            function(callback) {
                cacheManager.getUser(req.app, uids[i], function(err, result) {
                    ++i;
                    user.push(result);
                    callback(err, result);
                });
            },
            function(err, results) {
                protoManager.sendMsgToUser(res, protoid, users);
            }
        )
    });
}

friendController.getFriendMail = function(protoid, pkg, req, res, cb) {
    friendMailDao.getFriendMail(req.app, pkg.uid, function(err, results) {
        if (err != null) return cb(DEFINE.ERROR_CODE.SERV_ERROR[0]);

        var mails = cacheManager.parseFromPb("FriendMailList", results[0].mails);
        var list = [];
        for (var i in mails.mail) {
            var obj = [mails.mail[i].uid, mails.mail[i].type];
            list.push(obj);
        }

        var ret = {mail : list};

        protoManager.sendMsgToUser(res, protoid, ret);
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
                if (mails[i].type == type && mails[i].uid == friendid) ids.push(i);
            }
        }

        if (ids.length == 0) return cb(DEFINE.ERROR_CODE.FRIEND_MAIL_NOT_FOUND[0]);

        switch(type) {
            case CODE.FRIEND_MAIL_TYPE.APPLY:
                handleFriendApply(mails, ids, req, protoid, pkg, res);
                break;
            case CODE.FRIEND_MAIL_TYPE.GET_HP:
                break;
            case CODE.FRIEND_MAIL_TYPE.GIVE_GOLD:
                break;
        }

    });
}

friendController.requestHp = function(protoid, pkg, req, res, cb) {

}

/* @brief 公共函数定义
 */
function handleFriendApply(mails, ids, req, protoid, pkg, res) {
    if (pkg.answer == 1) {
        var uids = [];
        for (var i in ids) {
            uids.push(mails[i].uid);
        }

        async.parallel([
            function(callback) {
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

    });

});
            },
            function(callback) {

            }
        ], function(err, results) {

        });

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

            });

        });
    }

    for (var i in ids) {
        mails.slice(i, 1);
    }

    var buffer = cacheManager.serializeToPb("FriendMailList", {mail : mails});

    friendMailDao.addOrUpdateFriendMail(req.app, pkg.uid, {mails : buffer}, function(err, results) {
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
            friends.push(friendid);
            var buffer = cacheManager.serializeToPb("FriendList", {uid : friends});
            friendDao.addOrUpdateFriend(req.app, pkg.uid, {friendlist : buffer}, function(err, results) {
                utils.invokeCallback(cb, err, results);
            });
        }
    });
}
