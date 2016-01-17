
var DEFINE = server.DEFINE;

$(document).ready(function() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("aria-controls");
        if (target == 'proto_cmd') {
        } else if (target == 'maillist_cmd') {
            getMailList();
        }
    });

    $('#server_tool_tab a[href="#sysmail_cmd"]').tab('show');

    $("#file_name").change(importUser);

    $(".dateform").datetimepicker({
        language:'zh-CN',
        weekStart:1,
        todayBtn:1,
        autoclose:1,
        todayHighlight:1
    });
});


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
        $('#server_tool_tab a[href="#maillist_cmd"]').tab('show');
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


function getMailList() {
    var opt = {
        uid : $('#s_uid').val(),
        begin_time : $('#s_begintime').val(),
        end_time : $('#s_endtime').val(),
        title : $('#s_title').val()
    };

    if (opt.begin_time != "") opt.begin_time = getTime(opt.begin_time);
    if (opt.end_time != "") opt.end_time = getTime(opt.end_time);

    $.get('/gm/sysmaillog/list', opt, function(data) {
        var cont = "";
        cont = "<table class='table table-striped table-condense table-hover'><tr><th>发送时间</th><th>用户id</th><th>标题</th><th>过期时间</th><th>操作</th></tr>";
        for (var i in data) {
            cont +="<tr>";
            for (var j in data[i]) {
                if (j == 'id' || j == 'expire') cont += "<td>" + formatDate(data[i][j]) + "</td>";
                else cont += "<td>" + data[i][j] + "</td>";
            }
            cont += "<td><a href='#' onclick='sysmailLogOne("+data[i].id +","+data[i].uid +")'>详细</a></td>";
            cont +="</tr>";
        }

        cont += "</table>";
        $("#mail_list").html(cont);
    }, "json");
}

function sysmailLogOne(id, uid) {
    $.get('/gm/sysmaillog/one', {
        id : id,
        uid : uid
    }, function(data) {
        $('#info_title').html("邮件详情");
        var info = '<table class="table">';
        info += "<tr><th width='200px'>邮件时间:</th><td>" + formatDate(data.id) +"</td></tr>";
        info += "<tr><th>标题:</th><td>" + data.title +"</td></tr>";
        info += "<tr><th>内容:</th><td>" + data.content +"</td></tr>";
        info += "<tr><th>有效期:</th><td>" + formatDate(data.expire) +"</td></tr>";
        info += "<tr><th>附件:</th><td>";
        if (data.item.length == 0) {
            info += "无";
        }
        for (var i = 0; i < data.item.length; ++i) {
            info += data.item[i].itemid + " X " + data.item[i].count;
            if (i < data.item.length -1) {
                info += "<br/>";
            }
        }
        info += "</td></tr>";
        info += '</table>';

        $("#info_content").html(info);
        var footer = '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
        $("#info_footer").html(footer);
        $("#info").modal('show');
    }, "json");
}
