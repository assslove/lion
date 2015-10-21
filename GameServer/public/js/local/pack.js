/**
 * @brief pack
 * Created by bin.hou on 2015/5/15.
 */

/* @brief 查询礼包
 */
function queryPack()
{
    var pack_id = $("#pack_id").val();
    var open_count = $("#open_count").val();

    if (pack_id == "" || open_count == "") {
        alert("查询信息不能为空");
        return ;
    }

    if (open_count > 10000) {
        open_count = 10000;
    }

    $.post("/pack", {
        pack_id : pack_id,
        open_count : open_count
    }, function(data, status) {
        if (status == 500) {
            alert("礼包不存在");
            return ;
        }
        var mail_str = '<table class="table table-condensed table-hover table-striped" style="width:95%">' +
            '<caption><div class="row">' +
            '<div class="col-md-2">礼包名字:' + data.name + '</div>'+
            '<div class="col-md-6"></div>'+
            '<div class="col-md-2"></div></caption>' +
            '<thead><tr><th>物品id</th><th>物品名称</th><th>总数量</th><th>出现总次数</th><th>概率</th></tr></thead><tbody>';
        data = data.items;
        for (var i in data) {
            mail_str += "<tr>" +
                "<td>"  + i + "</td>" +
                "<td>" + data[i].name + "</td>" +
                "<td>" + data[i].count + "</td>" +
                "<td>" + data[i].times + "</td>" +
                "<td>" + data[i].prob + "</td>" +
                "</tr>";
        }
        mail_str += "</tbody></table>";
        $("#pack_list").html(mail_str);
    }, "json");
}

$(document).ready(function() {

});

