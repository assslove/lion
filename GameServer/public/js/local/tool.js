
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
    var UserCreateReq = builder.build("game").UserCreateReq;
    var userCreateReq = new UserCreateReq({
        uid : 10,
        type : 20,
        bind_id : '30'
    });

    var buff = userCreateReq.encode().toArrayBuffer();

    var msg = UserCreateReq.decode(buff);


});





