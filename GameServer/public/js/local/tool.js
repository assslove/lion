
var DEFINE = server.DEFINE;

$(document).ready(function() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("aria-controls");
        if (target == 'proto_cmd') {
        } else if (target == 'reload_conf_cmd') {
        }
    });

    $('#server_tool_tab a[href="#proto_cmd"]').tab('show');

    for (var i in DEFINE.PROTO) {
        $("#protoids").append("<option value='" + DEFINE.PROTO[i] + "'>" + i + "</option>");
    }

    $("#file_name").change(importUser);
});


/* @brief 发送消息 可以封装
 */
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
        rdata.r = getErrorStr(rdata.r);
//        $("#res").val(JSON.stringify(rdata, null, '\t'));
        $("#res").val(JSON.stringify(rdata));
        return ;
    }

    //rdata.p 为协议id
    //rdata.m 为包体
    $("#res").val(JSON.stringify(rdata));
}

function sendSysMail() {
    var obj = {
        uid : $("#uid").val(),
        title : $("#title").val(),
        content : $("#content").val(),
        expire : parseInt($("#expire").val()),
        item : []
    };

    if (obj.uid.split(',').length == 0) {
        alert("发送用户为空");
        return ;
    }

    var itemStr = $("#item").val();
    var tmpArr = JSON.parse(itemStr);
    for (var i in tmpArr) {
        obj.item.push({itemid : parseInt(tmpArr[i][0]), count : parseInt(tmpArr[i][1])});
    }

    $.post("/gm/sysmail/add", {
        json : JSON.stringify(obj)
    }, function(data) {
        alert(data);
    }, "text");
}

function importUser(e)
{
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, {type: 'binary'});

        var csv = "";
        workbook.SheetNames.forEach(function(sheetName) {
            csv += XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
            csv = csv.replace(/\n/g,',');
            return ;
        });
        csv = csv.slice(0, csv.length - 1);
        $("#uid").val(csv);
    };
    reader.readAsBinaryString(file);
}

