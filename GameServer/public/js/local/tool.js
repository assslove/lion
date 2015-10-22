
$(document).ready(function() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("aria-controls");
        if (target == 'proto_cmd') {
        } else if (target == 'reload_conf_cmd') {
        }
    });

    $('#server_tool_tab a[href="#proto_cmd"]').tab('show');


    ProtoBuf = dcodeIO.ProtoBuf;

    var builder = ProtoBuf.loadProtoFile("js/local/user.proto");
    var Game = builder.build("game");
    var UserCreateReq = Game["UserCreateReq"];
    var userCreateReq = new UserCreateReq({
        uid : 10,
        type : 20,
        bind_id : '30'
    });

    var buff = userCreateReq.encode().toArrayBuffer();

    var head = new Uint32Array(2);
    head[0] = buff.byteLength + 8; //长度
    head[1] = 1; //协议号

    var total = arrayBufferConcat(head.buffer, buff);

    var msg = UserCreateReq.decode(buff);

    $.ajax({
        url: '/proto',
        type: 'post',
        data : total,
        contentType : false,
        processData : false,
        dataType: 'text',
        success: function (data) {
            var ret = strToArrayBuffer(data);
            if (ret.length < 8) {
                console.log("error len");
            }

            var head = new Uint32Array(ret, 0, 2);
            console.log(head[0]);
            console.log(head[1]);
            var msg = ret.slice(8);
            var UserErrorRet = Game.UserErrorRet;
            var error = UserErrorRet.decode(msg);

            console.log(error.err_code);
        },
        error : function(xhr, textStatus, errorThrown){
            console.log(textStatus);
        }
    });
});





