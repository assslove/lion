/**
 * @brief 后台枚举值定义
 * Created by bin.hou on 2015/10/29.
 */

var code = {
    CACHE_TYPE : {
        USER : "h_usr_",
        USERID : "s_userid"
    },

    CACHE_KEY_TYPE : {
        USER : "k_usr",  //用户
        ITEM : "k_itm", //物品
        COPY : "k_cpy",  //副本
        PET : 'k_pet'    //宠物
    },

    MIN_UID : 100000000,
    USER_EXPIRE : 3600,  //一个小时间
    FRIEND_MAIL_TYPE : {
        APPLY : 1, //好友申请
        GET_HP : 2, //索取体力
        GIVE_HP : 3 //赠送体力
    }
}

module.exports = code;
