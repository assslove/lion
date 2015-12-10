var express = require('express');
var router = express.Router();

var http = require('http');
var logger = require('./../utils/log.js');

var accountDao = require('./../service/dao/accountDao.js');

var oauth_host = "oauth.anysdk.com";
var oauth_path = "/api/User/LoginOauth/";


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

/* @brief 充值回馈
 */
router.post('/pay_notify', function(req, res, next) {

});

module.exports = router;
