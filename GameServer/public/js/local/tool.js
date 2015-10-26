
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

});

function sendMsg() {
    $("#res").val("");
    var protoid = $("#protoids").val();
    var jsonStr = $("#req").val();

    var jsonObj = JSON.parse(jsonStr);

    var obj = {
        p: protoid, //协议号
        s: 0, //序列号
        m: jsonObj //json对象
    };

    $.ajax({
        url: '/proto',
        type: 'post',
        data : {b : JSON.stringify(obj)}, //消息体
        dataType: 'text',
        success: function (data) {
            handleResponse(data);
        },
        error : function(xhr, textStatus, errorThrown){
            alert("http error : " + textStatus);
        }
    });
}

function getErrorStr(code)
{
    for (var i in DEFINE.ERROR_CODE) {
        if (DEFINE.ERROR_CODE[i][0] == code) {
           return DEFINE.ERROR_CODE[i][1];
        }
    }

    return "错误未定义";
}

function handleResponse(data) {
    var rdata = JSON.parse(data);
    if (rdata.r != 0) { //返回码
        rdata.r = getErrorStr[rdata.r];
        $("#res").val(JSON.stringify(rdata), null, '\t');
        return ;
    }

    //rdata.p 为协议id
    //rdata.m 为包体
    $("#res").val(JSON.stringify(rdata), null, '\t');
}
