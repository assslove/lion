var express = require('express');
var router = express.Router();

var http = require('http');
var querystring = require('querystring');
var util = require('util');
var crypto = require('crypto');

var logger = require('./../utils/log.js');
var utils = require('./../utils/utils.js');
var accountDao = require('./../service/dao/accountDao.js');
var rechargeDao = require('./../service/dao/rechargeDao.js');

var oauth_host = "oauth.anysdk.com";
var oauth_path = "/api/User/LoginOauth/";
//anysdk privatekey
var private_key = '91CC561CDDDB702653F65179526975EA';
//anysdk 增强密钥
var enhanced_key = 'ZWVlN2Q4YTMzN2E3YzBhMTkyYjM';

/* @brief 登录验证
 */
router.post('/login_verify', function(req, res, next) {
    var opts = {
        host : oauth_host,
        path : oauth_path,
        method : "POST",
        headers : {
            "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
            "Content-Length": postData.length
        }
    };

    var postData = JSON.stringify(req.body);
    logger.debug("#post url:"+oauth_host+oauth_path);
    logger.debug("#post data:"+postData);
    var reqToAnysdk = http.request(options,function(resFromAnysdk){
        resFromAnysdk.setEncoding("utf8");
        resFromAnysdk.on("data",function(data){
            logger.debug("#return data:"+data);
            var resJson = JSON.parse(data);
            if (resJson && (resJson.status=="ok")) {
                var channel = resJson.common.channel;
                var channel_uid = resJson.common.uid;

                var uid = 0;
                accountDao.getUidByChannel(req.app, channel, channel_uid, function(err, results) {
                    if (err == null && results.length > 0) {
                        uid = results[0].uid;
                    }
                });

                var ext = {
                    uid : uid, //返回已经绑定的id 如果没有绑定，则客户端主动绑定
                    channel : channel,
                    channel_uid : channel_uid
                };
                resJson.ext = ext;
                res.send(JSON.stringify(resJson));
            } else {
                res.send(JSON.stringify(resJson));
            }
        });
    });

    reqToAnysdk.write(postData);
    reqToAnysdk.end();
});

//md5
var my_md5 = function(data){
    //中文字符处理
    data = new Buffer(data).toString("binary");
    return crypto.createHash('md5').update(data).digest('hex').toLowerCase();
}

//通用验签
var check_sign = function(post,private_key){
    var source_sign = post.sign;
    delete post.sign;
    var new_sign = get_sign(post,private_key);

    if(source_sign == new_sign){
        return true;
    }
    return false;
}

//增强验签
var check_enhanced_sign = function(post,enhanced_key){
    var source_enhanced_sign = post.enhanced_sign;
    delete post.enhanced_sign;
    delete post.sign;
    var new_sign = get_sign(post,enhanced_key);

    if(source_enhanced_sign == new_sign){
        return true;
    }
    return false;
}

//获取签名
var get_sign = function(post,sign_key){
    var keys = [];

    for(var key in post){
        logger.info("Key:"+key+"\tVaule:"+post[key]);
        keys.push(key);

    }
    keys = keys.sort();
    var paramString = '';
    for(i in keys){
        paramString += post[keys[i]];
    }
    logger.info("拼接的字符串:"+paramString);
    logger.info("第一次md5:"+my_md5(paramString));
    logger.info("加入密钥:"+my_md5(paramString)+sign_key);
    logger.info("第二次md5:"+my_md5(my_md5(paramString)+sign_key));

    return  my_md5(my_md5(paramString)+sign_key);
}

/* @brief 充值回馈
 */
router.post('/pay_notify', function(req, res, next) {
    var relIps = ["211.151.20.126","211.151.20.127"];
    var ip = utils.getClientIp(req);
    var isValid = false;
    for (var i in relIps) {
        if (ip.indexOf(relIps[i]) != -1) {
            isValid = true;
            break;
        }
    }

    if (!isValid) {
        return res.send("falied");
    }

    var payPkg = req.body;
    logger.info(JSON.stringify(payPkg));
    if(check_sign(payPkg,private_key) && check_enhanced_sign(payPkg,enhanced_key)){
        //异步处理游戏支付发放道具逻辑
        var recharge = {
            log_t : utils.getCurTime(),
            uid : payPkg.game_user_id,
            product_id : payPkg.product_id,
            cost : parseInt(parseFloat(payPkg.amout) * 10),
            cash : 0,
            order_id : payPkg.order_id
        };
        rechargeDao.addOrUpdateRecharge(req.app, uid, recharge, function(err, results) {
            res.send('ok');
        });
    } else {
        res.send(util.inspect(post));
    }
});

module.exports = router;
