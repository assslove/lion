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

var petController = module.exports;

petController.userSyncPet = function(protoid, pkg, req, res, cb) {
    var pet = pkg.pet;
    cacheManager.getPet(req.app, pkg.uid, function(err, results) {
        if (err != null) return cb(DEFINE.ERROR_CODE.USER_PET_ERROR);

        //TODO 校验 检验petid是否重复
        // 校验petid是否存在
        // 校验pet_suit是否重复

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

        for (var i in pet.petid) {
            src.petid.push(pet.petid[i]);
        }

        src.pet_equip = pet.pet_equip;
        for (var i in pet.pet_suit) {
            src.pet_suit.push({suitid : pet.pet_suit[i][0], flag : pet.pet_suit[i][1]});
        }


        var buffer = cacheManager.serializeToPb("PetInfo", src);

        for (var i in src.pet_suit) {
            src.pet_suit[i] = [src.pet_suit[i].suitid, src.pet_suit[i].flag];
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
                return cb(DEFINE.ERROR_CODE.PET_SAVE_ERROR);
            }

            protoManager.sendMsgToUser(res, protoid, src);
        });
    });
}

petController.userGetPet = function(protoid, pkg, req, res, cb){
    cacheManager.getPet(req.app, pkg.uid, function(err, results) {
        if (err != null || results == null) {
            return protoManager.sendMsgToUser(res, protoid, {pet : null});
        }

        var obj = cacheManager.parseFromPb("PetInfo", results);

        var pet_suit = [];
        for (var i in obj.pet_suit) {
            obj.pet_suit[i] = [obj.pet_suit[i].suitid, obj.pet_suit[i].flag];
        }

        return protoManager.sendMsgToUser(res, protoid, obj);
    });
}
