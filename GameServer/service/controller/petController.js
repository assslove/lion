/**
 * Created by houbin on 15-11-1.
 */

var async = require('async');

var DEFINE = require('./../../proto/define.js');
var logger = require("./../../utils/log.js");
var cacheManager = require("./../manager/cacheManager.js");
var CODE = require("./../../utils/code.js");
var utils = require('./../../utils/utils.js');
var protoManager = require('./../manager/protoManager.js');
var petDao = require('./../dao/petDao.js');
var petPartyDao = require('./../dao/petPartyDao.js');
var friendDao = require('./../dao/friendDao.js');

var petController = module.exports;

petController.userSyncPet = function(protoid, pkg, req, res, cb) {
    var pet = pkg.pet;
    cacheManager.getPet(req.app, pkg.uid, function(err, results) {
        if (err != null) return cb(DEFINE.ERROR_CODE.USER_PET_ERROR[0]);

        var src = {
            petid : [],
            pet_equip : 0,
            pet_suit : []
        };
        if (results != null) {
            var obj = cacheManager.parseFromPb("PetInfo", results);
            src.petid = obj.petid;
            src.pet_equip = obj.pet_equip;
            src.pet_suit = obj.pet_suit;
        }

        //TODO 校验 检验petid是否重复
        // 校验petid是否存在
        for (var i = 0; i < pet.petid.length; ) {
            if (src.petid.indexOf(parseInt(pet.petid[i])) != -1) {
                pet.petid.splice(i, 1);
            } else {
                ++i;
            }
        }

        // 校验pet_suit是否重复
        for (var i = 0; i < pet.pet_suit.length; ) {
            if (src.pet_suit.indexOf(parseInt(pet.pet_suit[i])) != -1) {
                pet.pet_suit.splice(i, 1);
            } else {
                ++i;
            }
        }

        for (var i in pet.petid) {
            src.petid.push(parseInt(pet.petid[i]));
        }

        src.pet_equip = pet.pet_equip;
        for (var i in pet.pet_suit) {
            src.pet_suit.push(parseInt(pet.pet_suit[i]));
        }


        var buffer = cacheManager.serializeToPb("PetInfo", src);

        for (var i in src.pet_suit) {
            src.pet_suit[i] = src.pet_suit[i];
        }

        async.parallel([
            function(callback) {
                petDao.addOrUpdatePet(req.app, pkg.uid,{pet : buffer}, callback);
            },
            function(callback) {
                cacheManager.updatePet(pkg.uid, buffer, callback);
            }
        ], function(err, results) {
            if (err != null) {
                return cb(DEFINE.ERROR_CODE.PET_SAVE_ERROR[0]);
            }

            cb(0);
          //  protoManager.sendMsgToUser(res, protoid, src);
        });
    });
}

petController.userGetPet = function(protoid, pkg, req, res, cb){
    cacheManager.getPet(req.app, pkg.uid, function(err, results) {
        if (err != null || results == null) {
            return protoManager.sendMsgToUser(res, protoid, {pet : null});
        }

        var obj = cacheManager.parseFromPb("PetInfo", results);

        return protoManager.sendMsgToUser(res, protoid, obj);
    });
}

petController.userGetPet = function(protoid, pkg, req, res, cb){
    cacheManager.getPet(req.app, pkg.uid, function(err, results) {
        if (err != null || results == null) {
            return protoManager.sendMsgToUser(res, protoid, {pet : null});
        }

        var obj = cacheManager.parseFromPb("PetInfo", results);
        return protoManager.sendMsgToUser(res, protoid, obj);
    });
}


function checkPetPartyGiftBox(petParty) {
    var cur = utils.getCurTime();
    var isChange = false;
    if (petParty.gift.length == 0) { //初始化
        for (var i = 0; i < 4; ++i) {
            var obj = {
                type : 0,
                begin : cur,
                lv : 0
            };

            petParty.gift.push(obj);
        }
        isChange = true;
    } else {
        var gifts = petParty.gift;
        for (var i in gifts) {
            if (gifts[i].lv == 4) { //已是最大等级
                continue;
            };

            var total_time = cur - gifts[i].begin;
            if (total_time < 1200) continue;

            if (gifts[i].type == 0 && total_time >= 1200) { //0-1级转化
                gifts[i].type = utils.randomRange(1, 3);
                total_time -= 1200;
                isChange = true;
            }

            var num = Math.floor(total_time / 1200);
            var turn = 3; //最大转化
            var j = 0;
            if (num > 10) num = 10;
            for (var k = 0; k < num; ++k) { //最大10次转化
                if (utils.isHitRandom(30)) {
                    gifts[i].lv += 1;
                    ++j;
                    isChange = true;
                    if (j > turn) break;
                }
            }

            gifts[i].begin = cur - (total_time - num * 1200);
        }
    }

    return isChange;
}

petController.getPetParty = function(protoid, pkg, req, res, cb){
    petPartyDao.getPetParty(req.app, pkg.uid, function(err, results) {
        if (err == null && results.length > 0) {
            var petParty = cacheManager.parseFromPb("PetParty", results[0].info);
            //TODO 宠物派对没有开放
            //if (checkPetPartyGiftBox(petParty)) { //有变化
            //    var buffer = cacheManager.serializeToPb("PetParty", petParty);
            //    petPartyDao.addOrUpdatePetParty(req.app, pkg.uid, {info : buffer}, function(err, results) {
            //        protoManager.sendMsgToUser(res, protoid, petParty);
            //    });
            //} else {
                protoManager.sendMsgToUser(res, protoid, petParty);
            //}
        } else {
            protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.PET_PARTY_DATA_ERROR[0]);
        }
    });
}

petController.getFriendPetParty = function(protoid, pkg, req, res, cb){
    //var uids = pkg.friendid;
    friendDao.getFriend(req.app, pkg.uid, function(err, results) {
        var uids = cacheManager.parseFromPb("FriendList", results[0].friendlist).uid;
        cacheManager.getPetParty(uids, function (err, results) {
            for (var i in uids) {
                results[i] = JSON.parse(results[i]);
                results[i].uid = uids[i];
            }

            var msg = {
                party: results
            };

            protoManager.sendMsgToUser(res, protoid, msg);
        });
    });
}

petController.petPartyLevelup = function(protoid, pkg, req, res, cb){
     petPartyDao.getPetParty(req.app, pkg.uid, function(err, results) {
         var petParty = cacheManager.parseFromPb("PetParty", results[0].info);
         //判断条件 TODO

         if (petParty.party_lv >= 5) {
             return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.GIFTBOX_LV_HIGH[0]);
         }

         petParty.party_lv += 1;

         async.parallel([
             function(callback) {
                 var buffer = cacheManager.serializeToPb("PetParty", petParty);
                 petPartyDao.addOrUpdatePetParty(req.app, pkg.uid, {info : buffer}, function(err, results) {
                     callback(err, results);
                 });
             },
             function(callback) {
                cacheManager.updatePetParty(pkg.uid, petParty, function(err, results) {
                    callback(err, results);
                });
             }
         ], function(err, results) {
             var ret = {
                 party_lv : petParty.party_lv
             };
             protoManager.sendMsgToUser(res, protoid, ret);
         });

     });
}

petController.giftBoxChange = function(protoid, pkg, req, res, cb){
    if (!(pkg.giftid >= 0 && pkg.giftid <= 3)) {
        return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.PROTO_PARA_ERROR[0]);
    }
    petPartyDao.getPetParty(req.app, pkg.uid, function(err, results) {
        var petParty = cacheManager.parseFromPb("PetParty", results[0].info);
        var gifts = petParty.gift_box;
        if (gifts[pkg.giftid].lv == 0) {
            return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.GIFTBOX_LV_LOW[0]);
        }

        gifts[pkg.giftid].type = 0;
        gifts[pkg.giftid].begin = utils.getCurTime();
        gifts[pkg.giftid].lv = 0;

        var buffer = cacheManager.serializeToPb("PetParty", petParty);
        petPartyDao.addOrUpdatePetParty(req.app, pkg.uid, {info : buffer}, function(err, results) {
            var msg = {
                gift : gifts[pkg.giftid]
            };

            protoManager.sendMsgToUser(res, protoid, msg);
        });
    });
}

petController.giftBoxGet = function(protoid, pkg, req, res, cb){
    if (!(pkg.giftid >= 0 && pkg.giftid <= 3)) {
        return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.PROTO_PARA_ERROR[0]);
    }

    petPartyDao.getPetParty(req.app, pkg.uid, function(err, results) {
        var petParty = cacheManager.parseFromPb("PetParty", results[0].info);
        var gifts = petParty.gift;

        if (gifts[pkg.giftid].lv < 1) {
            return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.GIFTBOX_LV_LOW[0]);
        }

        gifts[pkg.giftid].type = 0;
        gifts[pkg.giftid].begin = utils.getCurTime();
        gifts[pkg.giftid].lv = 0;
        petParty.gift_num += 1;

        var buffer = cacheManager.serializeToPb("PetParty", petParty);
        petPartyDao.addOrUpdatePetParty(req.app, pkg.uid, {info : buffer}, function(err, results) {
            var msg = {
                gift : gifts[pkg.giftid]
            };

            protoManager.sendMsgToUser(res, protoid, msg);
        });
    });
}

petController.userLikePetParty = function(protoid, pkg, req, res, cb) {
	pkg.uid = parseInt(pkg.uid);
	pkg.friendid = parseInt(pkg.friendid);
    petPartyDao.getPetParty(req.app, pkg.uid, function(err, results) {
        var petParty = cacheManager.parseFromPb("PetParty", results[0].info);

        if (petParty.melike.length >= 10) {
            return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.EVERYDAY_TIMES_LIMIT[0]);
        }

        for (var i in petParty.melike) {
            if (pkg.friendid == petParty.melike[i]) {
                return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.LIKE_FRIEND_ALREADY[0]);
            }
        }

        async.parallel([
            function(callback) { //给自己增加记录
                petParty.melike.push(pkg.friendid);
                var buffer = cacheManager.serializeToPb("PetParty", petParty);
                petPartyDao.addOrUpdatePetParty(req.app, pkg.uid, {info : buffer}, function(err, results) {
                    callback(err, results);
                });
            },
            function(callback) { //修改好友数据
                if (pkg.friendid == 101 || pkg.friendid == 102) { //机器人
                    return callback(null, null);
                }
                async.waterfall([
                    function(callback1) {
                        petPartyDao.getPetParty(req.app, pkg.friendid, function(err, results) {
                            var friendPetParty = cacheManager.parseFromPb("PetParty", results[0].info);
                            callback1(err, friendPetParty);
                        });
                    },
                    function(friendPetParty, callback1) {
                        friendPetParty.likeme.push(pkg.uid);
                        friendPetParty.total_like += 1;
                        var buffer = cacheManager.serializeToPb("PetParty", friendPetParty);
                        petPartyDao.addOrUpdatePetParty(req.app, pkg.friendid, {info : buffer}, function(err, results) {
                            callback1(err, friendPetParty);
                        });
                    },
                    function(friendPetParty, callback1) {
                        cacheManager.updateTotalLike(pkg.friendid, friendPetParty.total_like, function(err, results) {
                            callback(err, results);
                        });
                    }
                ], function(err, result) {
                   callback(err, result);
                });
            }
        ], function(err, results) {
            protoManager.sendErrorToUser(res, protoid, 0);
        });
    });
}

petController.userGetFriendPet = function(protoid, pkg, req, res, cb) {
    cacheManager.getPet(req.app, pkg.friendid, function(err, result) {
        var obj = cacheManager.parseFromPb("PetInfo", result);

        var msg = {
            petid : obj.petid
        };

        protoManager.sendMsgToUser(res, protoid, msg);
    });
}
