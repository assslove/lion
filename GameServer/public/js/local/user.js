/**
 * @brief user
 * Created by bin.hou on 2015/5/15.
 */

var role_config_list = {};

/* @brief 创建用户
*/
function saveAddUser()
{
    var opt = {
        username : $("#info_username").val(),
        type : $('#info_type').val()
    };

    if (opt.username == "") {
        alert("用户名不能为空");
        return ;
    }

    $.ajax({
        url : "/gm/gm_user",
        type : "PUT",
        data : opt,
        success : function(res) {
           if (res == 1) {
               getUserList();
               //$('#user_tab a[href="#user_config_list"]').tab('show');
           } else {
               alert("增加用户失败");
           }
        }
    })

}

function resetPassword(username)
{
    $.ajax({
        url : "/gm/gm_user",
        type : "POST",
        data : {
            username : username,
            password : username
        },
        success : function(res) {
            if (res == 1) {
                getUserList();
                alert("重置密码成功");
            } else {
                alert("重置密码失败");
            }
        }
    });
}

function delUser(username)
{
    $.ajax({
        url : "/gm/gm_user",
        type : "DELETE",
        data : {
            username : username
        },
        success : function(res) {
           if (res == 1) {
                getUserList();
           } else {
               alert("删除失败");
           }
        }
    });
}


/* @brief 获取用户列表
 */
function getUserList()
{
    $.get('/gm/gm_user', {}, function(data){
            var mail_str = '<table class="table table-condensed table-hover table-striped" style="width:95%">' +
                '<caption><div class="row">' +
                '<div class="col-md-8">' + '<input type="button" class="btn btn-default" value="增 加" onclick="addUser()"></div>' +
                '<div class="col-md-2">最近<strong>' + data.length + '</strong>条用户历史记录</div></div></caption>' +
                '<thead><tr><th>用户名</th><th>类型</th></tr></thead><tbody>';
            for (var i in data) {
                mail_str += "<tr>" +
                    "<th>" + data[i].username + "</th>" +
                    "<td>" + data[i].name + "</td>" +
                    "<td><a href='#' onclick='delUser(" + '"' + data[i].username + '"' + ")'>删除</a> " +
                    "<a href='#' onclick='resetPassword(" + '"' + data[i].username + '"' + ")'>重置密码</a> " +
                    "</tr>";
            }
            mail_str += "</tbody></table>";
            $("#user_config_body").html(mail_str);
    }, "json");
}

function saveRoleConfig() {
    var role_config = LANG.ROLE_CONFIG;
    var tmp = {};
    for (var i in role_config) {
        if (i != 'perm') {
            tmp[i] = $("#info_" + i).val();
        } else {
            tmp[i] = [];
            for (var j in MODELS) {
                tmp[i].push(parseInt($('input[name="info_perm_'+j+'"]:checked').val()));
            }
        }
    }

    $.post("/gm/gm_role", {"pkg" : JSON.stringify(tmp)}, function(data) {
        getRoleList();
    }, "text");
}

function saveAddRoleConfig() {
    var role_config = LANG.ROLE_CONFIG;
    var tmp = {};
    for (var i in role_config) {
        if (i != 'perm') {
            tmp[i] = $("#info_" + i).val();
        } else {
            tmp[i] = [];
            for (var j in MODELS) {
                tmp[i].push(parseInt($('input[name="info_perm_'+j+'"]:checked').val()));
            }
        }
    }

    $.post("/gm/gm_role/add", {"pkg" : JSON.stringify(tmp)}, function(data) {
        getRoleList();
    }, "text");
}



function addRoleConfig() {
    $('#info_title').html("新增角色");
    var content = "<form class='form-horizontal'>";
    var role_config = LANG.ROLE_CONFIG;
    for (var i in role_config) {
        content += "<div class='form-group'><label class='col-sm-4 control-label'>" + LANG.ROLE_CONFIG[i] + "</label>" +
            "<div class='col-sm-7'>";
        if (i != "perm") {
            content +="<input type='text' class='form-control' id='info_" + i + "'>";
        } else {
            content += "<table class='table'>"
            for (var j in MODELS) {
                content += "<tr><td>" + MODELS[j].desc + ": </td>";
                content += "<td><input type='radio' name='info_perm_"+j+"' value='0' checked='checked'>无</td>";
                content += "<td><input type='radio' name='info_perm_"+j+"' value='1' >有</td>";
            }
            content += "</table>"
        }

        content +="</div></div>";
    }

    $("#info_content").html(content);
    var footer = '<button type="button" class="btn btn-default" data-dismiss="modal" onclick="saveAddRoleConfig()">保存</button>';
    footer += '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
    $("#info_footer").html(footer);
    $("#info").modal('show');
}

function editRoleConfig(type) {
    var role_config = null;
    for (var i in role_config_list) {
        if (role_config_list[i].type == type) {
            role_config = role_config_list[i];
            break;
        }
    }
    $('#info_title').html("编辑角色");
    var content = "<form class='form-horizontal'>";
    for (var i in role_config) {
        content += "<div class='form-group'><label class='col-sm-4 control-label'>" + LANG.ROLE_CONFIG[i] + "</label>" +
            "<div class='col-sm-7'>";
        var readonly = "";
        if (i == 'type') {
            readonly = " readonly='readonly' ";
        }
        if (i != "perm") {
            content +="<input type='text' class='form-control' id='info_" + i + "' value='"+role_config[i]+"'"+readonly+">";
        } else {
            content += "<table class='table'>"
            for (var j in MODELS) {
                content += "<tr><td>" + MODELS[j].desc + ": </td>";
                var checkedlist = ["", ""];
                checkedlist[role_config.perm[j-1]] = " checked='' ";
                content += "<td><input type='radio' name='info_perm_"+j+"' value='0'" +checkedlist[0]+ ">无</td>";
                content += "<td><input type='radio' name='info_perm_"+j+"' value='1' "+checkedlist[1]+">有</td>";
            }
            content += "</table>"
        }

        content +="</div></div>";
    }

    $("#info_content").html(content);
    var footer = '<button type="button" class="btn btn-default" data-dismiss="modal" onclick="saveRoleConfig()">保存</button>';
    footer += '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
    $("#info_footer").html(footer);
    $("#info").modal('show');
}

function getPerm(type)
{
    switch (type) {
        case 1: return "有";
        default : return "无";
    }
}

function getRoleList()
{
    var role_config = $.cookies.get("role_config");
    $.get("/gm/gm_role/list", {}, function(data) {
        role_config_list = data;
        var tmp_str = '<table class="table table-condensed table-hover table-striped" style="width:95%">' +
            '<caption><div class="row">' +
            '<div class="col-md-8">' + '<input type="button" class="btn btn-default" value="增 加" onclick="addRoleConfig()"> ' +
            '</div>'+
            '<div class="col-md-2">最近<strong>' + data.length + '</strong>条角色历史记录</div></div></caption>' +
            '<thead><tr><th>角色id</th><th>角色名称</th><th>权限</th><th>操作</th></ht></tr></thead><tbody>';
        for (var i in data) {
            tmp_str += "<tr>" +
                "<th>" + data[i].type + "</th>" +
                "<th>" + data[i].name + "</th>" +
                "<td><table>";
            for (var j in MODELS) {
                if (data[i].perm[j-1] == 0) continue;
                tmp_str += "<tr><td>" + MODELS[j].desc +":    </td><td>"+getPerm(data[i].perm[j-1])+"</td></tr>";

            }

            tmp_str += "</table></td><td><a href='#' onclick='editRoleConfig(" + data[i].type + ")'>编辑</a> " +
            "<a href='#' onclick='delRoleConfig(" + data[i].type + ")'>删除</a> " +
            "</tr>";
        }
        tmp_str += "</tbody></table>";
        $("#role_config_body").html(tmp_str);
    }, "json");
}

function delRoleConfig(type)
{
    $.ajax({
        url : "/gm/gm_role",
        type : "DELETE",
        data : {
            type : type
        },
        success : function(res) {
           if (res == 1) {
                getRoleList();
           } else {
               alert("删除失败");
           }
        }
    });
}

function addUser() {
    $.get("/gm/gm_role/list", {}, function(data) {
        $('#info_title').html("新增用户");
        var content = "<form class='form-horizontal'>";
        var user = LANG.USER;
        for (var i in user) {
            content += "<div class='form-group'><label class='col-sm-4 control-label'>" + LANG.USER[i] + "</label>" +
                "<div class='col-sm-5'>";
            if (i == 'type') {
                content +="<select type='text' class='form-control' id='info_" + i + "'>";
                for (var j in data) {
                    content += "<option value='"+data[j].type+"'>"+data[j].name+"</option>";
                }
                content +="</select>";
            } else {
                content +="<input type='text' class='form-control' id='info_" + i + "'>";
            }

            content +="</div></div>";
        }

        $("#info_content").html(content);
        var footer = '<button type="button" class="btn btn-default" data-dismiss="modal" onclick="saveAddUser()">保存</button>';
        footer += '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
        $("#info_footer").html(footer);
        $("#info").modal('show');
    }, "json");
}

$(document).ready(function() {
    $('#user_tab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if (e.target.href.indexOf("user_config_list") !== -1) {
            getUserList("");
        } else if (e.target.href.indexOf("role_config_list") !== -1) {
            getRoleList("");
        }
    });

    $('#user_tab a[href="#user_config_list"]').tab('show');
});


