/**
 * @brief 协议处理
 * Created by houbin on 15-10-18.
 */
var path = require("path");
var DEFINE = require('./../../proto/define');
var logger = require('./../../utils/log.js');
var encrypt = require('./../../utils/encrypt.js');

var userController = require('./../controller/userController.js');
var itemController = require('./../controller/itemController.js');
var copyController = require('./../controller/copyController.js');
var petController = require('./../controller/petController.js');
var friendController = require('./../controller/friendController.js');
var mailController = require('./../controller/mailController.js');
var cacheManager = require("./cacheManager.js");

module.exports = function(app) {
    return new ProtoHandler(app);
}

function ProtoHandler(app) {
    this.app = app;
    this.protoHandlers = {};
}


/* @brief init proto
 */
ProtoHandler.prototype.init = function() {
    this.protoHandlers[DEFINE.PROTO.USER_LOGIN] =  [userController.userLogin];
    this.protoHandlers[DEFINE.PROTO.USER_BIND] =  [userController.userBind];
    this.protoHandlers[DEFINE.PROTO.USER_LOGOUT] = [userController.userLogout];
    this.protoHandlers[DEFINE.PROTO.USER_CREATE] = [userController.userCreate];
    this.protoHandlers[DEFINE.PROTO.USER_SYNC_INFO] = [userController.userSyncInfo];
    this.protoHandlers[DEFINE.PROTO.USER_SYNC_ITEM] = [itemController.userSyncItem];
    this.protoHandlers[DEFINE.PROTO.USER_SYNC_COPY] = [copyController.userSyncCopy];
    this.protoHandlers[DEFINE.PROTO.USER_GET_INFO] = [userController.userGetInfo];
    this.protoHandlers[DEFINE.PROTO.USER_SYNC_TIME] = [userController.userSyncTime];
    this.protoHandlers[DEFINE.PROTO.USER_SYNC_PET] = [petController.userSyncPet];
    this.protoHandlers[DEFINE.PROTO.USER_GET_PET] = [petController.userGetPet];
    this.protoHandlers[DEFINE.PROTO.GET_OTHER_USER] = [userController.getOtherUser];
    this.protoHandlers[DEFINE.PROTO.FRIEND_ADD] = [friendController.friendAdd];
    this.protoHandlers[DEFINE.PROTO.FRIEND_DEL] = [friendController.friendDel];
    this.protoHandlers[DEFINE.PROTO.USER_GET_FRIENDS] = [friendController.getFriends];
    this.protoHandlers[DEFINE.PROTO.USER_GET_FRIEND_MAIL] = [friendController.getFriendMail];
    this.protoHandlers[DEFINE.PROTO.USER_READ_FRIEND_MAIL] = [friendController.readFriendMail];
    this.protoHandlers[DEFINE.PROTO.USER_REQUEST_HP] = [friendController.requestHp];
    this.protoHandlers[DEFINE.PROTO.USER_GIVE_GOLD] = [friendController.giveGold];
    this.protoHandlers[DEFINE.PROTO.USER_GET_COPYRANK] = [userController.getCopyRank];
    this.protoHandlers[DEFINE.PROTO.USER_GET_PET_PARTY] = [petController.getPetParty];
    this.protoHandlers[DEFINE.PROTO.USER_GET_FRIEND_PETPARTY] = [petController.getFriendPetParty];
    this.protoHandlers[DEFINE.PROTO.USER_PET_PARTY_LEVELUP] = [petController.petPartyLevelup];
    this.protoHandlers[DEFINE.PROTO.USER_GIFTBOX_CHANGE] = [petController.giftBoxChange];
    this.protoHandlers[DEFINE.PROTO.USER_GIFTBOX_GET] = [petController.giftBoxGet];
    this.protoHandlers[DEFINE.PROTO.USER_LIKE_PETPARTY] = [petController.userLikePetParty];
    this.protoHandlers[DEFINE.PROTO.USER_GET_FRIEND_PET] = [petController.userGetFriendPet];
    this.protoHandlers[DEFINE.PROTO.USER_GET_SIGN_INFO] = [userController.userGetSignInfo];
    this.protoHandlers[DEFINE.PROTO.USER_SIGN] = [userController.userSign];
    this.protoHandlers[DEFINE.PROTO.USER_GET_SYSMAIL] = [mailController.getSysMail];
    this.protoHandlers[DEFINE.PROTO.USER_READ_SYSMAIL] = [mailController.readSysMail];
    this.protoHandlers[DEFINE.PROTO.USER_LOGIN_PLATFORM] = [userController.userLoginPlatform];
    this.protoHandlers[DEFINE.PROTO.USER_UNBIND] = [userController.userUnbind];

    logger.info("init proto handlers success");
}


/* @param req 请求包	required uint32 uid = 1;
	repeated uint32 friendid = 2; //已经开启宠物派对的好友
 * @param res 返回
 * @cb 回调函数
 */
ProtoHandler.prototype.handle = function(protoid, pkg, req, res, cb) {
    if (this.protoHandlers[protoid] == null || this.protoHandlers[protoid] == undefined) {
        cb(DEFINE.ERROR_CODE.PROTO_NOT_FOUND[0]);
        return ;
    }
    try {
        if (protoid != DEFINE.PROTO.USER_CREATE 
			&& protoid != DEFINE.PROTO.USER_BIND
			&& protoid != DEFINE.PROTO.USER_LOGIN
			&& protoid != DEFINE.PROTO.USER_LOGIN_PLATFORM) {

            var tmpProtoHandlers = this.protoHandlers;

			if (pkg.uid == null || pkg.uid == "") {
				return cb(DEFINE.ERROR_CODE.PROTO_DATA_INVALID[0]);
			}
            cacheManager.checkUser(pkg.uid, function(err, result) {
                if (err != null || result == 0) {
                    return cb(DEFINE.ERROR_CODE.USER_SESSION_EXPIRE[0]);
                }

                tmpProtoHandlers[protoid][0](protoid, pkg, req, res, cb);
            });
        } else {
            this.protoHandlers[protoid][0](protoid, pkg, req, res, cb);
        }
    } catch (e) {
        logger.error("proto error %s", e);
        cb(DEFINE.ERROR_CODE.PROTO_NOT_FOUND[0]);
    }
}

ProtoHandler.prototype.sendErrorToUser = function(res, proto_id, err) {
    var obj = {p : proto_id, r : err};
	var msg = JSON.stringify(obj);
	logger.debug(msg);
    //res.send(encrypt.encode(new Buffer(msg).toString('base64'))));
    res.send(msg);
}

ProtoHandler.prototype.sendMsgToUser = function(res, protoid, msg) {
    if (msg == null || msg == undefined) {
        this.sendErrorToUser(res, protoid, 0);
        return ;
    }

    var obj = {p : protoid, r : 0, m : msg};
	var msg = JSON.stringify(obj);
	logger.debug(msg);
    //res.send(encrypt.encode(new Buffer(msg).toString('base64'))));
    res.send(msg);
}

