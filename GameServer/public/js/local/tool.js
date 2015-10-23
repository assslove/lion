var protoHandlers = {};

ProtoBuf = dcodeIO.ProtoBuf;
var builder = ProtoBuf.loadProtoFile("js/local/proto/user.proto");
var Game = builder.build("game");

$(document).ready(function() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("aria-controls");
        if (target == 'proto_cmd') {
        } else if (target == 'reload_conf_cmd') {
        }
    });

    $('#server_tool_tab a[href="#proto_cmd"]').tab('show');


    for (var i in proto) {
        $("#protoids").append("<option value='"+ proto[i]+"'>"+i+"</option>");
    }

    initProtoHandlers();

//    ProtoBuf = dcodeIO.ProtoBuf;
//
//    var builder = ProtoBuf.loadProtoFile("js/local/user.proto");
//    var Game = builder.build("game");
//    var UserCreateReq = Game["UserCreateReq"];
//    var userCreateReq = new UserCreateReq({
//        uid : 10,
//        type : 20,
//        bind_id : '30'
//    });
//
//    var buff = userCreateReq.encode().toArrayBuffer();
//
//    var head = new Uint32Array(2);
//    head[0] = buff.byteLength + 8; //长度
//    head[1] = 1; //协议号
//
//    var total = arrayBufferConcat(head.buffer, buff);
//
//    var msg = UserCreateReq.decode(buff);
//
//    $.ajax({
//        url: '/proto',
//        type: 'post',
//        data : total,
//        contentType : false,
//        processData : false,
//        dataType: 'text',
//        success: function (data) {
//            var ret = strToArrayBuffer(data);
//            if (ret.length < 8) {
//                console.log("error len");
//            }
//
//            var head = new Uint32Array(ret, 0, 2);
//            console.log(head[0]);
//            console.log(head[1]);
//            var msg = ret.slice(8);
//            var UserErrorRet = Game.UserErrorRet;
//            var error = UserErrorRet.decode(msg);
//
//            console.log(error.err_code);
//        },
//        error : function(xhr, textStatus, errorThrown){
//            console.log(textStatus);
//        }
//    });
});


function initProtoHandlers()
{
    protoHandlers[DEFINE.PROTO.USER_LOGIN] =  ["UserLoginReq", "UserLoginRet"];
    protoHandlers[DEFINE.PROTO.USER_LOGOUT] = ["UserLogoutReq"];
    protoHandlers[DEFINE.PROTO.USER_CREATE] = ["UserCreateReq"];
}


function sendMsg() {


    var protoid = $("#protoids").val();

    var jsonStr = $("#req").val();

    var msgLen = 0;
    var buffer = null;
    var totalBuffer = null;

    if (protoHandlers[protoid][0] != null || protoHandlers[protoid][1] != undefined) {
        msgLen = 0;
    } else {
        var jsonObj = JSON.parse(jsonStr);
        var Msg = Game[protoHandlers[protoid][0]];
        msg = new Msg(jsonObj);
        buffer = msg.encode().toArrayBuffer();
        msgLen = buffer.byteLength;
    }

    var head = new Uint32Array(2);
    head[0] = msgLen + 8; //长度
    var tmp = new Uint16Array(head.buffer, 4, 2);
    tmp[0] = protoid;
    tmp[1] = 0;

    if (msgLen == 0) {
        totalBuffer = head.buffer;
    } else {
        totalBuffer = arrayBufferConcat(head.buffer, buffer);
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

function handleResponse(data) {

    var ret = strToArrayBuffer(data);
    if (ret.length < 8) {
        alert("server error len");
    }

    var head = new Uint32Array(ret, 0, 2);
    var len = head[0];
    var tmp = new Uint16Array(ret, 4, 2);
    var protoid = tmp[0];
    var seq = tmp[1]

    var buffer = ret.slice(8);

    var Msg = Game[protoHandlers[protoid][1]];
    var msg = Msg.decode(buffer);

    var obj = {
        len : len,
        protoid : protoid,
        seq : seq,
        msg : msg.toJSON()
    }

    $("#res").html(obj.toString());
}
