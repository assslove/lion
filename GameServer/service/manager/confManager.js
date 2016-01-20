/**
 * Created by bin.hou on 2015/12/17.
 */

var path = require('path');
var configJson = require('config.json');

var logger = require('./../../utils/log.js');

//签到集合
var markDate = {};
//物品集合
var itemData = {};

var confManager = module.exports;

confManager.initConf = function()
{
    confManager.initMarkDate();
    confManager.initItemData();
}

confManager.initMarkDate = function() {
    markDate = configJson(path.join(__dirname, "./../../config/json/markdate.json"));
    var count = 0;
    for (var i in markDate) {
        if (i != 1 && i != 2 && i != 3) {
            delete markDate[i];
        } else {
            ++count;
        }
    }

    logger.info("load markdate config: " + count);
}

/* @brief 获取签到奖励
 */
confManager.getMarkDateReward = function(order) {
    return markDate[order+1].rewards;
}

confManager.initItemData = function()
{
    itemData = configJson(path.join(__dirname, "./../../config/json/itemData.json"));
    var count = 0;
    for (var i in itemData) {
        ++count;
    }
    logger.info("load itemdata config: " + count);
}

confManager.getItemInfo = function(id) {
    return itemData[id];
}
