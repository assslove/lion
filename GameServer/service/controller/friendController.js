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
    var friendId = pkg.friendId;

    friendMailDao.getFriendMail(req.app, friendId, function(err, results) {
        if (err != null) {
            return cb(DEFINE.ERROR_CODE.SERV_ERROR[0]);
        }

        if (results.length == 0) {
            return cb(DEFINE.ERROR_CODE.FRIEND_NOT_FOUND[0]);
        }

        var mails = cacheManager.parseFromPb("FriendMailList", results[0].mails);

        var newMails = cacheManager.serializeToPb("FriendMailList", mails);

        var obj = {
            uid : friendId,
            mails : newMails
        };

        friendMailDao.addOrUpdateFriendMail(req.app, obj, function(err, results) {
            protoManager.sendErrorToUser(res, protoid, 0);
        });
    });
}

friendController.friendDel = function(protoid, pkg, req, res, cb) {

}

friendController.getFriends  = function(protoid, pkg, req, res, cb) {

}
