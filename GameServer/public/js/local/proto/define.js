//normal define
var proto = {
    USER_CREATE : 1,    //创建用户
    USER_LOGIN : 2,     //除用户创建外，所有请求必须先登录
    USER_LOGOUT : 3,    //登出
    USER_SYNC_INFO : 4, //同步玩家数据
    USER_SYNC_ITEM : 5, //同步物品
    USER_SYNC_TIME_ITEM : 6, //同步限时物品
    USER_SYNC_COPY : 7, //同步关卡
    USER_GET_INFO : 8   //同步服务器数据 包括玩家数据,物品，限时物品,关卡等
};

//错误码 编号与描述，方便客户端显示
var error_code =  {
    PROTO_NOT_FOUND : [1, "协议不存在"],
    USER_NOT_LOGIN :  [2,  "用户没有登录"],
    PROTO_LEN_INVALID:  [3,  "协议长度不正确"],
    PROTO_DATA_INVALID:  [4,  "协议数据不正确"],
    USER_SESSION_EXPIRE:  [5,  "用户session过期"],
    MSG_NOT_FOUND:  [6,  "返回消息体没有找到"]
};

var ret = {
    PROTO : proto,
    ERROR_CODE : error_code
};

var head = {
    p : '协议id',
    s : '序列号或者返回码'
};

module.exports = ret;

