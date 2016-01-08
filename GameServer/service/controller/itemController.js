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
var itemDao = require('./../dao/itemDao.js');

var itemController = module.exports;

itemController.userSyncItem = function(protoid, pkg, req, res, cb) {
    var items = pkg.item;
    cacheManager.getItem(req.app, pkg.uid, function(err, results) {
        var itemMap = {};
        for (var i in results) {
            itemMap[results[i].itemid] = [results[i].count, results[i].expire];
        }

        //校验是是否足够
        for (var i in items) {
            if (items[i][1] < 0) {
                if (itemMap[items[i][0]] == undefined || itemMap[items[i][0]][0] + items[i][1] < 0) {
                    return cb(DEFINE.ERROR_CODE.ITEM_NOT_ENOUGH[0]);
                }
            }
        }

        var count = 0;
        for (var i in items) {
            if (itemMap[items[i][0]] != undefined) {
                count =  itemMap[items[i][0]][0] + items[i][1];
            } else {
                count = items[i][1];
            }
            itemMap[items[i][0]] = [count, items[i][2]];
        }

        var allItems = [];
        for (var i in itemMap) {
            if (itemMap[i][0] == 0) continue;
            allItems.push({
                itemid : parseInt(i),
                count : itemMap[i][0],
                expire : itemMap[i][1],
            });
        }

        var info = cacheManager.serializeToPb("ItemList", {item : allItems});
        //检验道具合法性 TODO
        async.parallel([
            function(callback) {
                cacheManager.updateItem(pkg.uid, info, callback);
            },
            function(callback){
                itemDao.addOrUpdateItem(req.app, pkg.uid, {info : info}, callback);
            }
        ], function(err, results) {
            var items = [];
            for (var i in allItems) {
                items.push([allItems[i].itemid, allItems[i].count, allItems[i].expire]);
            }
            if (err == null || err == undefined) {
          //      protoManager.sendMsgToUser(res, protoid, {item : items});
                cb(0);
            } else {
                cb(DEFINE.ERROR_CODE.ITEM_SAVE_ERROR[0]);
            }
        });
    });
}
