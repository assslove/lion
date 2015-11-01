//normal define
//客户端与服务端共用代码

(function(global, factory) {

    /* AMD */ if (typeof define === 'function' && define["amd"])
        define([], factory);
    /* CommonJS */ else if (typeof require === 'function' && typeof module === "object" && module && module["exports"])
        module["exports"] = factory();
    /* Global */ else
        (global["server"] = global["server"] || {})["DEFINE"] = factory();

})(this, function() {
    var PROTO = {
        USER_CREATE : 1,    //创建用户
        USER_LOGIN : 2,     //除用户创建外，所有请求必须先登录
        USER_LOGOUT : 3,    //登出
        USER_SYNC_INFO : 4, //同步玩家数据
        USER_SYNC_ITEM : 5, //同步物品
        USER_SYNC_COPY : 6, //同步关卡
        USER_GET_INFO : 7   //同步服务器数据 包括玩家数据,物品，限时物品,关卡等
    };

    //错误码 编号与描述，方便客户端显示
    var ERROR_CODE =  {
        PROTO_NOT_FOUND : [1, "协议不存在"],
        USER_NOT_LOGIN :  [2,  "用户没有登录"],
        PROTO_LEN_INVALID:  [3,  "协议长度不正确"],
        PROTO_DATA_INVALID:  [4,  "协议数据不正确"],
        USER_SESSION_EXPIRE:  [5,  "用户session过期"],
        MSG_NOT_FOUND:  [6,  "返回消息体没有找到"],
        USER_EXIST:  [7,  "用户已经存在"],
        USER_NOT_EXIST:  [8,  "用户不存在"],
        USER_DATA_ERROR : [9, "用户数据错误"],
    };

    //登录绑定方式
    var BIND_TYPE = {
        BIND_QQ : 1,       //qq登录
        BIND_WECHAT : 2    //微信登录
    };

    var DEFINE = {
        PROTO : PROTO,
        ERROR_CODE : ERROR_CODE,
        BIND_TYPE : BIND_TYPE
    };

    return DEFINE;
});

