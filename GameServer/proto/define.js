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
        USER_GET_INFO : 7,  //获取服务器数据 包括玩家数据,物品,关卡
        USER_SYNC_PET : 8,  //同步宠物
        USER_SYNC_TIME : 9,  //同步服务器时间
        USER_GET_PET : 10,   //获取宠物
        GET_OTHER_USER : 11, //获取其它玩家数据
		FRIEND_ADD : 12,	 //增加好友
		FRIEND_DEL : 13,     //删除好友
		USER_GET_FRIENDS : 14, //获取好友列表
		USER_GET_FRIEND_MAIL : 16, //获取好友邮件
		USER_READ_FRIEND_MAIL : 17, //读取好友邮件
		USER_REQUEST_HP : 18,		//索要体力
        USER_GIVE_GOLD : 19,		//赠送金币
        USER_GET_COPYRANK : 20,     //获取好友关卡排行
		USER_GET_PET_PARTY : 21,    //获取宠物派对信息
		USER_GET_FRIEND_PETPARTY : 22, //获取好友宠物派对
		USER_PET_PARTY_LEVELUP : 23,   //宠物派对升级
		USER_GIFTBOX_CHANGE : 24,	   //换一个 礼盒
		USER_GIFTBOX_GET :	25,        //领取奖励 校验
        USER_LIKE_PETPARTY : 26,        // 给好友点赞
        USER_GET_FRIEND_PET : 27,       // 获取好友宠物
        USER_BIND : 28,                //绑定渠道与本账号
        USER_GET_SIGN_INFO : 29,       //获取签到信息
        USER_SIGN : 30,                //签到
		USER_GET_SYSMAIL : 31,			// 获取系统邮件
		USER_READ_SYSMAIL : 32,			// 读取系统邮件
		USER_LOGIN_PLATFORM : 33,		// 登录平台 360 ...
        USER_UNBIND : 34,               // 解绑账号(用于测试)
		USER_IOS_GET_ORDERID : 35,		// 获取本地交易id
		USER_IOS_RECEIPT_VERIFY : 36,	// 验证receipt
        USER_GET_SOME_LIMIT: 37,        // 根据key 获取limit信息
		
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
        USER_SAVE_ERROR : [10, "用户信息保存错误"],
        ITEM_SAVE_ERROR : [11, "物品保存错误"],
        COPY_SAVE_ERROR : [12, "副本保存错误"],
        PET_SAVE_ERROR : [13, "宠物保存错误"],
        USER_PET_ERROR : [14, "宠物数据错误"],
        SERV_ERROR : [15, "服务器出错"],
        FRIEND_NOT_FOUND : [16, "好友找不到"],
        FRIEND_MAIL_NOT_FOUND : [17, "好友邮件找不到"],
        ITEM_NOT_ENOUGH : [18, "物品不足"],
        PET_PARTY_DATA_ERROR : [19, "宠物数据出错"],
        EVERYDAY_TIMES_LIMIT : [20, "超过每日次数限制"],
        LIKE_FRIEND_ALREADY : [21, "已经为这个好友点过赞"],
        PROTO_PARA_ERROR : [22, "协议参数错误"],
        GIFTBOX_LV_LOW : [23, "礼盒等级不足一级"],
        GIFTBOX_LV_HIGH: [24, "礼盒达到最高等级"],
        SIGN_DATA_ERROR : [25, "签到信息出错"],
        SIGN_ALREADY : [26, "已经签到"],
        USER_NICK_NULL: [27, "用户昵称为空"],
        DB_ERROR: [28, "数据库出错"],
        MAIL_NOT_FOUND: [29, "邮件找不到"],
        GET_HP_ALREADY: [30, "已经给这个好友索要体力"],
        REWARD_DAY_LIMIT : [31, "每日领取限制"],
        CHANNEL_NOT_EXIST : [32, "渠道不存在"],
        LOGIN_PLATFORM_FAIL : [33, "登录渠道失败"]
    };

    //登录绑定方式
    var BIND_TYPE = {
        BIND_QQ : 1,       //qq登录
        BIND_WECHAT : 2    //微信登录
    };

    //渠道编号
	var CHANNEL = {
		QIHU_360 : 1, //360
	};

    var DEFINE = {
        PROTO : PROTO,
        ERROR_CODE : ERROR_CODE,
        BIND_TYPE : BIND_TYPE,
        CHANNEL : CHANNEL
    };
    // limit 范围限定
    var LIMIT_RANGE = {
        LIMIT_FOREVER_BEGIN : 1,
        LIMIT_FOREVER_END: 10000,
        LIMIT_DAILY_BEGIN : 10001,
        LIMIT_DAILY_END : 20000,
    };

    // limit key 定义
    var LIMIT_KEY = {
        // 永久key

        // 每日key
    };

    return DEFINE;
});

