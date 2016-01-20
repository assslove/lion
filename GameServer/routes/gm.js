/**
 * @brief GM命令 用于对服务器进行一些操作
 * Created by bin.hou on 2015/10/29.
 */

var express = require('express');
var async = require('async');

var router = express.Router();

var uidDao = require('../service/dao/uidDao.js');
var cacheManager = require('../service/manager/cacheManager.js');
var confManager = require('../service/manager/confManager.js');
var CODE = require('../utils/code.js');
var utils = require('../utils/utils.js');
var sysMailDao = require('../service/dao/sysMailDao.js');
var mailDao = require('../service/dao/mailDao.js');
var sysMailLogDao = require('../service/dao/sysMailLogDao.js');
var gmRoleDao = require('../service/dao/gmRoleDao.js');
var gmUserDao = require('../service/dao/gmUserDao.js');
var md5 = require('MD5');
var redis = require('../utils/redis.js');


router.get('/gen_uid', function(req, res, next) {
    var count = req.query.count;

    uidDao.getMaxUid(req.app, function(err, results) {
        if (err !== null) return res.send(err.message);

        var start = 0;
        if (results.length != 0 && results[0] != null)  start = parseInt(results[0].uid) + 1;
        else start = CODE.MIN_UID + 1;
        var end = start + parseInt(count);
        async.whilst(
            function() { return start < end;},
            function(callback) {
                async.parallel([
                        function(cb) {
                            uidDao.insertOrUpdateUidFlag(req.app, start, 0, function(err, res) {
                                cb(err, res);
                            });
                        },
                        function(cb){
                            cacheManager.addUid(start, function(err, res) {
                                cb(err, res);
                            })
                        }
                    ], function(err, results) {
                        ++start;
                        callback(err);
                    }
                )
            },
            function(err) {
                if (err === null || err === undefined) {
                    res.send(utils.getRetMsg(0, "init uid success!"));
                } else {
                    res.send(utils.getRetMsg(1, "init uid failed!"));
                }
            }
        );
    });
});

router.post('/sysmail/add', function(req, res, next) {
    var data = JSON.parse(req.body.json);
    for (var i in data.item) {
        if (confManager.getItemInfo(data.item[i].itemid + ".0") == undefined) {
            return res.send("物品id不存在");
        }
    }
    var uid = data.uid.split(',');
    var id = utils.getCurTime();
    var obj = {
        title : data.title,
        content : data.content
    };

    obj.expire = id + 3600 * 24 * data.expire;

    if (uid.length == 1 && uid[0] == 0) { //系统邮件
        obj.item = cacheManager.serializeToPb("ItemList", {item : data.item});
        async.series([
            function(cb) {
                sysMailDao.addOrUpdateSysMail(req.app, id, obj, cb);
            },
            function(cb) {
                obj.id = id;
                obj.uid = 0;
                sysMailLogDao.addOrUpdateSysMailLog(req.app, obj, cb);
            }
        ], function(err, results) {
            if (err == null) res.send("发送系统邮件成功");
            else res.send("发送系统邮件失败");
        });
    } else { //指定用户邮件
        var i = 0, total = uid.length;
        async.whilst(
            function() {return i < total},
            function(callback) {
                mailDao.getMail(req.app, uid[i], function(err, results) {
                    if (err != null) {
                        ++i;
                        return callback(err);
                    }
                    var mails = cacheManager.parseFromPb("SysMailList", results[0].info).mail;
                    obj.item = data.item;
                    obj.id = id;
                    mails.push(obj);

                    var buffer = cacheManager.serializeToPb("SysMailList", {mail : mails});
                    async.series([
                        function(cb) {
                            mailDao.addOrUpdateMail(req.app, uid[i], {info : buffer}, cb);
                        },
                        function(cb) {
                            var sysMailLog = utils.clone(obj);
                            sysMailLog.uid = uid[i];
                            sysMailLog.item = cacheManager.serializeToPb("ItemList", {item : obj.item});
                            sysMailLogDao.addOrUpdateSysMailLog(req.app, sysMailLog, cb);
                        }
                    ], function(err, results) {
                        ++i;
                        callback(err);
                    });
                });
            },
            function(err) {
                if (err != null) res.send("发送邮件失败");
                else res.send("发送邮件成功");
            }
        );
    }
});

router.get('/sysmaillog/list', function(req, res, next) {
    sysMailLogDao.getSysMailLogByCond(req.app, req.query, function(err, data) {
        res.send(data);
    });
});

router.get('/sysmaillog/one', function(req, res, next) {
    sysMailLogDao.getOneSysMailLog(req.app, req.query.id, req.query.uid, function(err, results) {
        results[0].item = cacheManager.parseFromPb("ItemList", results[0].item).item;
        res.send(results[0]);
    });
});

router.get("/gm_role/list", function(req, res, next) {
    gmRoleDao.getGmRoleList(req, function(err, data) {
        if (err === null) {
            for (var i in data) { //反序列化权限标志位
                var perms = cacheManager.parseFromPb("RolePermission", data[i].perm).flag;
                data[i].perm = perms;
            }
            res.send(data);
        } else {
            res.send(500);
        }
    });
});

router.post("/gm_role", function(req, res, next) {
    var pkg = JSON.parse(req.body.pkg);
    var perms = cacheManager.serializeToPb("RolePermission", {flag: pkg.perm});
    var obj = {
        type: pkg.type,
        name : pkg.name,
        perm : perms
    };
    gmRoleDao.updateGmRole(req, obj, function(err, data) {
        if (err === null) {
            res.send(data);
        } else {
            res.send(500);
        }
    });
});

router.delete("/gm_role", function(req, res, next) {
    gmRoleDao.deleteGmRole(req, req.body.type, function(err, data) {
        if (err === null) {
            res.send("1");
        } else {
            res.send("0");
        }
    });
});

router.post("/gm_role/add", function(req, res, next) {
    var pkg = JSON.parse(req.body.pkg);
    var perms = cacheManager.serializeToPb("RolePermission", {flag: pkg.perm});
    var obj = {
        type : pkg.type,
        name : pkg.name,
        perm : perms
    };
    gmRoleDao.insertGmRole(req, obj, function(err, data) {
        if (err === null) {
            res.send(data);
        } else {
            res.send(500);
        }
    });
});


router.post("/gm_role/perm", function(req, res, next) {
    gmRoleDao.getGmRolePerm(req, req.body.username, function(err, data) {
        if (err === null) {
            if (data.length != 0) {
                var perms = cacheManager.parseFromPb("RolePermission", data[0].perm).flag;
                res.send(perms);
            } else {
                res.send([]);
            }
        } else {
            res.send(500);
        }
    });
});


/* @brief 获取用户列表
 */
router.get('/gm_user', function(req, res, next) {
    gmUserDao.getGmUserList(req.app, function(err, data) {
        if (err === null) {
            res.send(data);
        } else {
            res.statusCode = 500;
            res.send("0");
        }
    });
});

/* @brief 更新用户密码
 */
router.post('/gm_user', function(req, res, next) {
    gmUserDao.updateGmUser(req.app, [md5(req.body.password), req.body.username], function(err, data) {
        if (err === null) {
            res.send("1");
        } else {
            res.send("0");
        }
    });
});

/* @brief 增加用户
 */
router.put("/gm_user", function(req, res, next) {
    var username = req.body.username;
    var password = req.body.username;
    var type = req.body.type;
    gmUserDao.addGmUser(req.app, [username, md5(password), type], function(err, data) {
        if (err === null) {
            res.send("1");
        } else {
            res.send("0");
        }
    });
});

/* @brief 删除用户
 */
router.delete('/gm_user', function(req, res, next) {
    gmUserDao.delGmUser(req.app, req.body.username, function(err, data) {
        if (err === null) {
            res.send("1");
        } else {
            res.send("0");
        }
    });
});


/* @brief 修改用户密码
 */
router.post('/gm_user/change', function(req, res, next) {
    gmUserDao.getGmUser(req.app, [req.body.username], function(err, data) {
        if (md5(req.body.old_password) != data[0].password) {
            res.send("0");
        } else {
            gmUserDao.updateGmUser(req.app, [md5(req.body.password), req.body.username], function(err, data) {
                if (err === null) {
                    res.send("1");
                } else {
                    res.send("0");
                }
            });
        }
    });
});

router.get("/login", function(req, res, next) {
    var username = req.query.username;
    var password = req.query.password;

    gmUserDao.getGmUser(req.app, username, function(err, data) {
        if (data.length !== 0) { //如果没有管理员,插入管理员
            if (data[0].password == md5(password)) {
                redis.setex(username, 1800, 1, null);
                res.send("1");
            } else {
                res.send('0');
            }
        } else if (username === "admin") {
            gmUserDao.addGmUser(req.app, [username, md5(password), 1], function(err, data) {
                if (err === null) {
                    res.send("1");
                } else {
                    res.send("0");
                }
            });
        } else {
            res.send("0");
        }
    });
});


router.post('/login/check', function(req, res, next) {
    var username = req.body.username;
    redis.get(username, function(err, result) {
        if (result == null) {
            res.send("0");
        } else {
            res.send("1");
        }
    });
});

router.post("/logout", function(req, res, next) {
    var username = req.cookies.username;
    redis.del(username, function(err, result) {
        res.send("1");
    });
});


module.exports = router;