/**
 * @brief 后台枚举值定义
 * Created by bin.hou on 2015/10/29.
 */

var code = {
    CACHE_TYPE : {
        USER : "h_usr:",   // 单个用户缓存记录 key: CACHE_KEY_TYPE , value: 相关联的信息
        USERID : "s_userid", // 账号id生成
        COPY_SCORE : 'h_cpy_score:',  // 玩家关卡通过记录 key : uid, value:max_score
        USER_BASE: 'h_usr_base',    // 用户基本信息,用于好友列表用 key:uid, value:userinfo
        PET_PARTY : "h_pet_party", // 好友宠物派对
        IOS_ORDERID : "s_ios_orderid", // ios 交易id
        IOS_ORDERINFO : "s_iosorder:"   // ios 临时交易信息
    },

    CACHE_KEY_TYPE : {
        USER : "k_usr",  //用户
        ITEM : "k_itm", //物品
        COPY : "k_cpy",  //副本
        PET : 'k_pet',    //宠物
        LIMIT : 'k_limit'    //limit
    },

    MIN_UID : 100000000,
    USER_EXPIRE : 3600,     //一个小时间
    IOS_ORDER_EXPIRE : 3600,  //交易信息10秒后过期
    FRIEND_MAIL_TYPE : {
        APPLY : 1,    //好友申请
        GET_HP : 2,   //索取体力
        GIVE_HP : 3,  //赠送体力
        GIVE_GOLD : 4 //赠送金币
    },
    GET_HP_MAXTIMES: 20,
    GET_GOLD_MAXTIMES: 20
}

module.exports = code;
