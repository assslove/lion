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
    var items = JSON.parse(pkg.item);
    cacheManager.getItem(req.app, pkg.uid, function(err, results) {
        var itemMap = {};
        for (var i in results) {
            itemMap[results[i][0]] = [results[i][1], results[i][2]];
        }

        for (var i in items) {
            itemMap[items[i][0]] = [items[i][1], items[i][2]];
        }

        var allItems = [];
        for (var i in itemMap) {
            allItems.push([i, itemMap[i][0], itemMap[i][1]]);
        }

        //检验道具合法性 TODO
        async.parallel([
            function(callback) {
                cacheManager.updateItem(pkg.uid, allItems, callback);
            },
            function(callback){
                var i = 0, total = items.length;
                async.whilst(
                    function() {return i < total;},
                    function(callback1) {
                            var saveItem = {
                                itemid : items[i][0],
                                count : items[i][1],
                                expire : items[i][2]
                            };
                        itemDao.addOrUpdateItem(req.app, pkg.uid, saveItem, function(err, res) {
                            ++i;
                            callback1(err, res);
                        });
                    },
                    function(err) {
                        callback(err, null);
                    }
                )
            }
        ], function(err, results) {
            if (err == null || err == undefined) {
                protoManager.sendMsgToUser(res, protoid, allItems);
            } else {
                cb(DEFINE.ERROR_CODE.ITEM_SAVE_ERROR[0]);
            }
        });
    });
}
