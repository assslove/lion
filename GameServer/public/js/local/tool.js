var protoHandlers = {};

ProtoBuf = dcodeIO.ProtoBuf; //获取对象
var builder = ProtoBuf.loadProtoFile("js/local/proto/user.proto"); //加载文件
var Game = builder.build("game"); //获取包对象

$(document).ready(function() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("aria-controls");
        if (target == 'proto_cmd') {
        } else if (target == 'reload_conf_cmd') {
        }
    });

    $('#server_tool_tab a[href="#proto_cmd"]').tab('show');


    for (var i in proto) {
        $("#protoids").append("<option value='" + proto[i] + "'>" + i + "</option>");
    }

    initProtoHandlers();
});

/* @brief 初始化协议处理
 */
function initProtoHandlers()
{
    protoHandlers[DEFINE.PROTO.USER_LOGIN] =  ["UserLoginReq", "UserLoginRet"]; //协议号-请求包-返回包
    protoHandlers[DEFINE.PROTO.USER_LOGOUT] = ["UserLogoutReq"];
    protoHandlers[DEFINE.PROTO.USER_CREATE] = ["UserCreateReq", "UserCreateRet"];
}


/* @brief 发送消息 可以封装
 */
function sendMsg() {
    var protoid = $("#protoids").val();
    var jsonStr = $("#req").val();

    var msgLen = 0;
    var buffer = null;
    var totalBuffer = null;
    var msg = null;

    if (protoHandlers[protoid][0] == null || protoHandlers[protoid][0] == undefined) {
        msgLen = 0;
    } else {
        var jsonObj = JSON.parse(jsonStr); //转化成json对象
        var Msg = Game[protoHandlers[protoid][0]]; //获取请求协议对象
        msg = new Msg(jsonObj); //创建实例
        buffer = msg.encode().toArrayBuffer(); //转化成ArrayBuffer
        msgLen = buffer.byteLength;
    }

    var head = new Uint32Array(2); 
    head[0] = msgLen + 8; //长度
    var tmp = new Uint16Array(head.buffer, 4, 2);
    tmp[0] = protoid; //初始化协议号
    tmp[1] = 0; //初始化序列号,验证用,先赋值0

    if (msgLen == 0) {
        totalBuffer = head.buffer;
    } else {
        totalBuffer = arrayBufferConcat(head.buffer, buffer); //合并buffer
    }

    $.ajax({
        url: '/proto',
        type: 'post',
        data : totalBuffer,
        contentType : false,
        processData : false,
        dataType: 'text',
        success: function (data) {
            handleResponse(data);
        },
        error : function(xhr, textStatus, errorThrown){
            alert("http error : " + textStatus);
        }
    });
}

/* @brief 接收请求
 */
function handleResponse(data) {
    var ret = dcodeIO.ByteBuffer.fromUTF8(data).buffer; //转化成arrayBuffer
    if (ret.length < 8) {
        alert("server error len");
    }

    var head = new Uint32Array(ret, 0, 2);
    var len = head[0]; //长度
    var tmp = new Uint16Array(ret, 4, 2); 
    var protoid = tmp[0]; //协议号
    var seq = tmp[1] //返回码 如果不等于0，则查define.js的ERROR_CODE进行显示处理

     var obj = {
        len : len,
        protoid : protoid,
        seq : seq
    }

    if (seq != 0 || protoHandlers[protoid] == undefined) {
        $("#res").html(obj.toString());
        return ;
    }

    var buffer = ret.slice(8); //获取消息体

    var Msg = Game[protoHandlers[protoid][1]]; //获取返回消息对象
    var msg = Msg.decode(buffer); //解码

    obj["msg"] = JSON.parse(msg.encodeJSON()); //转化成json

    $("#res").val(JSON.stringify(obj, null, '\t')); //显示
}
