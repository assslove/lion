/**
 * @brief user
 * Created by bin.hou on 2015/5/15.
 */
var PER_PAGE = 15;
var role = {};
var obj = {};

function saveRole() {
    for (var i in role) {
        if (i == "strength_time" || i == "oper_time" || i == "mail_time" || i == "last_login" || i == "ban_time") {
            role[i] = Math.floor(new Date($("#info_" + i).val()).getTime()/1000);
        } else {
            role[i] = $("#info_" + i).val();
        }
    }

    $.post("/role", role, function(data) {
        getRoleList("", role.uid, "");
    }, "text");
}

function onChangeLv() {
    var lv = $("#info_level").val();
    $.post("/role/exp", {
        level : lv
    }, function(data) {
        $("#info_exp").val(data);
    }, "text");
}

function onChangeSoulLv() {
    var id = $("#info_soul_id").val();
    var lv = $("#info_level").val();
    if (lv > 80) {
        alert("超过最大等级!");
        return ;
    }
    $.post("/soul/exp", {
        id : id,
        level : lv
    }, function(data) {
        $("#info_exp").val(data);
    }, "text");
}

function editRole(roleid) {
    $.get('/role/one', {
        roleid : roleid
    }, function(data){
        role = data; //保存数据结构
        delete data.allbin;
        $('#info_title').html("编辑角色信息");
        var content = "<form class='form-horizontal'>";
        for (var i in data) {
            var readonly = "";
            //if (i == "uid" || i == "type" || i == "accid" || i == "sexy") {
            if (i == "uid" || i == "type" || i == "sexy") {
                readonly = "readonly='readonly'";
            }

            var val = data[i];
            var classInfo = "";
            if (i == "strength_time" || i == "oper_time" || i == "mail_time" || i == "last_login" || i == "ban_time") {
                readonly = "data-date-format='yyyy-mm-dd hh:ii'";
                val = formatDate(val);
                classInfo = " date_form";
            } else if (i == "level") {
                readonly = "onchange='onChangeLv()'";
            }

            content += "<div class='form-group'><label class='col-sm-4 control-label'>" + LANG.ROLE[i] + "</label>" +
                "<div class='col-sm-7'><input type='text' class='form-control" + classInfo + "' " + readonly + "id='info_" + i + "' value='" + val + "'>" +
                "</div></div>";
        }

        $("#info_content").html(content);
        var footer = '<button type="button" class="btn btn-default" data-dismiss="modal" onclick="saveRole()">保存</button>';
        footer += '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
        $("#info_footer").html(footer);
        $(".date_form").datetimepicker({
            language:'zh-CN',
            weekStart:1,
            todayBtn:1,
            autoclose:1,
            todayHighlight:1,
            pickerPosition : 'top-left'
        });
        $("#info").modal('show');
    }, "json");
}

function delRole(roleid) {
    $.ajax({
        url : "/role",
        type : "DELETE",
        data : {
            roleid : roleid
        },
        success :function(data) {
            if (data == 1) {
                getRoleList("", roleid, "");
            } else {
                alert("删除失败");
            }
        }
    });
}

function banRole(roleid) {
    $.ajax({
        url : "/role/ban",
        type : "POST",
        data : {
            roleid : roleid
        },
        success :function(data) {
            if (data == 1) {
                searchUser();
            } else {
                alert("操作失败");
            }
        }
    });
}

function viewRole(roleid) {
    $.get('/role/one', {
        roleid : roleid
    }, function(data){
        delete data.allbin;
        $('#info_title').html("查看角色信息");

        var content = '<table class="table table-hover table-condensed">';
        for (var i in data) {
            if (i == "strength_time" || i == "oper_time" || i == "mail_time" || i == "last_login" || i == "ban_time") {
                data[i] = formatDate(data[i]);
            }
            content += "<tr><th width='200px'>" + LANG.ROLE[i] + "</th><td>" + data[i] +"</td></tr>";
        }
        content += '</table>';
        $("#info_content").html(content);
        var footer = '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
        $("#info_footer").html(footer);
        $("#info").modal('show');
    }, "json");
}

function searchUser() {
    var accid = $("#role_accid").val();
    var roleid = $("#role_id").val();
    var name = $("#role_name").val();

//    if (accid == "" && roleid == "" && name == "") {
//        alert("搜索条件不能为空");
//        return ;
//    }

    getRoleList(accid, roleid, name);
}

/* @brief 获取角色列表
 */
function getRoleList(accid, roleid, name)
{
    $.get('/role', {
        accid : accid,
        roleid : roleid,
        name : name
    }, function(data){
        var mail_str = '<hr/><table class="table table-hover table-striped" style="width:95%">';

        mail_str += '<caption><div class="row">' +
            '<div class="col-md-10">当前搜索角色列表</div>'+
            '<div class="col-md-2">最近<strong>' + data.length + '</strong>条角色历史记录</div></div></caption>';
        if (data.length > 0) {
            mail_str += '<thead><tr>';
            var n = 0;
            mail_str += '<th></th>';
            for (var i in data[0]) {
                if (n++ > 10) {
                    break;
                }
                mail_str += '<th>' + LANG.ROLE[i] + '</th>';
            }

            mail_str += '<th>操作</th>';
            mail_str += '</tr></thead><tbody>';
        }

        for (var i in data) {
            mail_str += "<tr>";
            var n = 0;
            mail_str +=  '<td><input type="radio" name="selectRoles" class="selectRoles" value="' + data[i].uid + '"></td>';
            for (var j in data[i]) {
                if (n++ > 10) {
                    break;
                }
                mail_str += "<td>" + data[i][j] + "</td>";
            }
            mail_str += "<td><a href='#' onclick='editRole(" + '"' + data[i].uid + '"' + ")'>编辑</a> ";
            mail_str += "<a href='#' onclick='viewRole(" + '"' + data[i].uid + '"' + ")'>详情</a> ";
//            if (data[i].flag & 0x1) {
//                mail_str += "<a href='#' onclick='banRole(" + '"' + data[i].uid + '"' + ")'>解封</a> ";
//            } else {
//                mail_str += "<a href='#' onclick='banRole(" + '"' + data[i].uid + '"' + ")'>封号</a> ";
//            }
			/*mail_str += "<a href='#' onclick='delRole(" + '"' + data[i].uid + '"' + ")'>删除</a> ";*/
            mail_str += "</td></tr>";
        }

        if (data.length > 0) {
            mail_str += "</tbody></table>";
        }

        $("#role_list").html(mail_str);

        $(".selectRoles").change(function() {
            var uid = $("input[name='selectRoles']:checked").val();
            $.cookies.set("view_roleid", [uid]);
        });

    }, "json");
}

/* @brief 获取分页的信息
 * @param start 开始页数
 * @param total 总共记录
 */
function getPageStr(start, total, cb)
{
    var real_start = start;
    var roleid = $.cookies.get("view_roleid")[0];
    var tmp = "<ul class='pagination'>";

    if (start < 6) {
        tmp += '<li class="disabled"><a href="#">上一页</a></li>';
    } else {
        var prev = (parseInt((start-1)/5)-1) * 5 + 1;
        var cb_str = cb + "('"+roleid+"',"+prev+" ,"+total+")";
        tmp += '<li><a href="#" onclick="'+cb_str+'">上一页</a></li>';
    }

    start = parseInt((start-1)/5) * 5 + 1;
    var total_page = Math.ceil(total / PER_PAGE);
    for (var i = start, j = 1; j <= 5 && i <= total_page; j++, i++) {
        var active_str = "";
        if (i === real_start) {
            active_str = ' class="active"';
        }
        var cb_str = cb + "('"+roleid+"',"+i+" ,"+total+")";
        tmp += '<li'+ active_str +'><a href="#" onclick="' +cb_str+ '">' + i + '</a></li>';
    }

    if (Math.floor((start-1)/5) == Math.floor((total_page-1)/5)) { //最后一页
        tmp += '<li class="disabled"><a href="#" onclick="">下一页</a></li>';
    } else {
        var last = (parseInt((start-1)/5) + 1) * 5 + 1;
        var cb_str = cb + "('"+roleid+"',"+last+" ,"+total+")";
        tmp += '<li><a href="#" onclick="'+cb_str+'">下一页</a></li>';
    }
    tmp += '</ul>';

    return tmp;
}

/* @brief 当cur_page > 1 时不再获取长度 分页标签已经有长度
 */
function getRealSoulList(roleid, cur_page, total)
{
    var role_config = $.cookies.get('role_config');
    var start = (cur_page - 1) * PER_PAGE;
    $.get('/soul', {
        roleid : roleid,
        start : start
    }, function(data){
        var mail_str = '<table class="table table-hover table-striped" style="width:95%">';

        mail_str += '<caption><div class="row">' +
            '<div class="col-md-10">' + roleid +'的灵魂列表</div>'+
            '<div class="col-md-2">共<strong>' + total + '</strong>条灵魂记录</div></div></caption>';
        if (data.length > 0) {
            mail_str += '<thead><tr>';
            delete data[0].uid;
            for (var i in data[0]) {
                mail_str += '<th>' + LANG.SOUL[i] + '</th>';
            }

            mail_str += '<th>操作</th>';
            mail_str += '</tr></thead><tbody>';
        }

        for (var i in data) {
            mail_str += "<tr>";
            for (var j in data[i]) {
                delete data[i].uid;
                mail_str += "<td>" + data[i][j] + "</td>";
            }
            if (role_config[3] == 2) {
                mail_str += "<td><a href='#' onclick='editSoul(" + '"' + data[i].id + '"' + ")'>编辑</a> ";
                mail_str += "<a href='#' onclick='delSoul(" + '"' + data[i].id + '"' + ")'>删除</a></td>";
            }
            mail_str += "</tr>";
        }

        if (data.length > 0) {
            var pagestr = getPageStr(cur_page, total, "getSoulList");
            mail_str += "</tbody></table>" + pagestr;
        }

        $.cookies.set("soul_curpage", cur_page);
        $("#soul_list").html(mail_str);
    }, "json");
}

/* @brief 获取灵魂列表
 */
function getSoulList(roleid, cur_page, total)
{
    if (cur_page != 1) {
        getRealSoulList(roleid, cur_page, total)
        return ;
    }

    $.get('/soul/total', {
        roleid : roleid
    }, function(data) {
        $.cookies.set("soul_total", data.count);
        getRealSoulList(roleid, cur_page, data.count);
    }, "json");
}


function saveSoul() {
    for (var i in obj) {
        obj[i] = $("#info_" + i).val();
    }

    $.post("/soul", obj, function(data) {
        getSoulList(obj.uid, $.cookies.get("soul_curpage"), $.cookies.get("soul_total"));
    }, "text");
}

function editSoul(id) {
    $.get('/soul/one', {
        id : id
    }, function(data){
        obj = data; //保存数据结构
        $('#info_title').html("编辑灵魂信息");
        var content = "<form class='form-horizontal'>";
        for (var i in data) {
            var readonly = "";
            if (i == "id" || i == "uid") {
                readonly = "readonly='readonly'";
            } else if (i == "level") {
                readonly = "onchange='onChangeSoulLv()'"
            }
            content += "<div class='form-group'><label class='col-sm-4 control-label'>" + LANG.SOUL[i] + "</label>" +
                "<div class='col-sm-7'><input type='text' class='form-control' " + readonly + "id='info_" + i + "' value='" + data[i] + "'>" +
                "</div></div>";
        }

        $("#info_content").html(content);
        var footer = '<button type="button" class="btn btn-default" data-dismiss="modal" onclick="saveSoul()">保存</button>';
        footer += '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
        $("#info_footer").html(footer);
        $("#info").modal('show');
    }, "json");
}

function delSoul(id) {
    $.ajax({
        url : "/soul",
        type : "DELETE",
        data : {
            id : id
        },
        success :function(data) {
            if (data == 1) {
                var view_roleid = $.cookies.get('view_roleid');
                getSoulList(view_roleid[0], 1, 0);
            } else {
                alert("删除失败");
            }
        }
    });
}

$(document).ready(function() {
    $('#user_tab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var view_roleid = $.cookies.get('view_roleid');
        if (view_roleid === null) return ;
        var target = $(e.target).attr("aria-controls");
        if (target == ("role_soul") ) {
            if (view_roleid != null && view_roleid.length > 0) {
                getSoulList(view_roleid[0], 1, 0);
            }
        } else if (target == ("role_blade")) {
            if (view_roleid != null && view_roleid.length > 0) {
                getBladeList(view_roleid[0], 1, 0);
            }
        } else if (target == ("role_copy")) {
            if (view_roleid != null && view_roleid.length > 0) {
                getCopyList(view_roleid[0]);
            }
        } else if (target == ("role_task")) {
            if (view_roleid != null && view_roleid.length > 0) {
                getTaskList(view_roleid[0]);
            }
        } else if (target == ("role_item")) {
            if (view_roleid != null && view_roleid.length > 0) {
                getItemList(view_roleid[0], 1, 0);
            }
        } else if (target == ("role_arena")) {
            if (view_roleid != null && view_roleid.length > 0) {
                getRoleArena(view_roleid[0]);
            }
        } else if (target == ("role_soulroom")) {
            if (view_roleid != null && view_roleid.length > 0) {
                getSoulRoom(view_roleid[0]);
            }
        } else if (target == ("role_commandphone")) {
            if (view_roleid != null && view_roleid.length > 0) {
                getCommandPhone(view_roleid[0]);
            }
        } else if (target == ("role_activity")) {
            if (view_roleid != null && view_roleid.length > 0) {
                getActivity(view_roleid[0]);
            }
        } else if (target == ("role_shop")) {
            if (view_roleid != null && view_roleid.length > 0) {
                getShop(view_roleid[0]);
            }
        } else if (target == ("role_soulfight")) {
            if (view_roleid != null && view_roleid.length > 0) {
                getSoulFight(view_roleid[0]);
            }
        }
    });

    $('#user_tab a[href="#role_search"]').tab('show');
});


