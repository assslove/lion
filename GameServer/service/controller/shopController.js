/**
 * 负责钻石购买的逻辑
 * Created by bin.hou on 2016/3/3.
 */

var shopController = module.exports;

var redis = require('../../utils/redis.js');
var DEFINE = require('./../../proto/define.js');
var CODE = require("./../../utils/code.js");
var protoManager = require('./../manager/protoManager.js');
var iap = require('in-app-purchase');
var logger = require("./../../utils/log.js");
var confManager = require('./../manager/confManager.js');

shopController.iosGetOrderId = function(protoid, pkg, req, res, cb) {
    redis.incr(CODE.CACHE_TYPE.IOS_ORDERID, function(err, result) {
        if (err != null) {
            protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.SERV_ERROR);
        } else {
            redis.setex(CODE.CACHE_TYPE.IOS_ORDERINFO + pkg.uid, CODE.IOS_ORDER_EXPIRE, result, function(err, results) {
                var jsonObj = {
                    orderid : result
                };
                protoManager.sendMsgToUser(res, protoid, jsonObj);
            });
        }
    });
}

shopController.iosVerifyReceipt = function(protoid, pkg, req, res, cb) {
    var uid = pkg.uid;
    var receipt = pkg.receipt;
    var orderid = pkg.orderid;

    logger.info("uid=%d, receipt=%s", uid, receipt);

    redis.get(CODE.CACHE_TYPE.IOS_ORDERINFO + uid, function(err, result) {
        if (result == null) {
            return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.ORDER_NOT_FOUND[0]);
        }

        iap.config({
            requestDefaults: {
                timeout: 5000
            }
        });

        iap.setup(function(err) {
            if (err) {
                return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.SERV_ERROR[0]);
            }

            iap.validate(iap.APPLE, receipt, function(err, response) {
                if (iap.isValidated(response)) {
                    var options = {
                        ignoreExipred: true
                    };
                    var dataList = iap.getPurchaseData(response, options);
                    logger.info("uid=%d, data=%s", uid, JSON.stringify(dataList));

                    var productInfo = dataList[0];

					var pidList = ["zs60", "zs180", "zs300", "zs1280"];
					var index = 0;
					for (var i in pidList) {
						if (pidList[i] == productInfo.product_id) {
							index = i;
							break;
						}
					}
					++index;
                    var shopData = confManager.getShopInfo(index + ".0");

                    //TODO 增加记录 且解析商品表
                    var jsonObj = {
						cash : parseInt(shopData.f * 10),
						productid : shopData.product_id
                    };

                    protoManager.sendMsgToUser(res, protoid, jsonObj);
                } else {
					logger.error("validate receipt : %s", err.code);
					return protoManager.sendErrorToUser(res, protoid, DEFINE.ERROR_CODE.SERV_ERROR[0]);
				}
            });
        });
    });
}
