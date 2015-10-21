function savePassword()
{
    var oldPassword = $('#oldPassword').val();
    var newPassword = $('#newPassword').val();
    var rePassword = $('#rePassword').val();

    if (newPassword != rePassword) {
        alert("二次输入密码不一致")
        return ;
    }

    $.ajax({
        url : "/user/change",
        type : "POST",
        data : {
            username : $.cookies.get('username'),
            password : newPassword,
            old_password : oldPassword
        },
        success : function(res) {
            if (res == 1) {
            //    alert("修改密码成功");
            } else {
                alert("修改密码失败");
            }
            $('#user_info').modal('toggle')
        }
    });
}

function logout()
{
    $.post("/logout", {}, function(data) {
        window.location.href = "login.html";
        $.cookies.clear("username");
    }, "text");
}

function initServerList()
{
    $.get('/zone_config/live', {},
        function(data) {
            for (var i in data) {
                $("#server_list").append("<option value='" + data[i].id + "' >" + data[i].name + "</option>");
            }
            var server_id = data[0].id;
            connectServer(server_id);
            $.cookies.set("sel_server", server_id);
        }, "json");
}

function connectServer(server_id)
{
    $.post('/server_list/connect', {
        server_id : server_id
    }, function(data) {
        $("#server_state").html(data);
        $("#server_list").val(server_id);
        var menu = $.cookies.get('sel_menu');
        if (menu == "role" || menu == "arena" || menu == "server") {
            $('#' + $.cookies.get('sel_menu')).click();
        }
    }, "text");
}

$(document).ready(function(){
    var username = $.cookies.get("username");
    $.post('/login/check', { //检查用户是否验证通过
        username : username
    }, function(data) {
        if (data === "0") {
            window.location.href = "login.html";
            return ;
        }

        $.post('/role_config/perm', { //获取用户权限
            username : username
        }, function(data) {
            $.cookies.set("role_config", data);
            var main_nav = '<ul class="nav nav-sidebar">' +
                '<li id="index" class="menu active"><a href="#">首页</a></li>';

            for (var i in MODELS) {
                if (data.length == 0 || data[parseInt(i)-1] != 0) {
                    if (i == 8) continue;
                    main_nav +='<li id="'+MODELS[i].name+'" class="menu"><a href="#">'+MODELS[i].desc+'</a></li>';
                }
            }
//            main_nav +='<li id="mail" class="menu"><a href="#">GM邮件</a></li>';
//            main_nav +='<li id="gift" class="menu"><a href="#">礼品码</a></li>';
//
//            if (username === "admin") {
//                main_nav += '<li id="user_manager" class="menu"><a href="#">用户管理</a></li>';
//            }
//
//            main_nav += '<li id="role" class="menu"><a href="#">角色管理</a></li>';
//            main_nav += '<li id="pack" class="menu"><a href="#">礼包模拟</a></li>';
//            main_nav += '<li id="arena" class="menu"><a href="#">竞技场排名</a></li>';
//            main_nav += '<li id="arena_robot" class="menu"><a href="#">竞技场机器人</a></li>';
//            main_nav += '<li id="zone" class="menu"><a href="#">区服管理</a></li>';
//            main_nav += '<li id="server" class="menu"><a href="#">服务器监控</a></li>';
//            main_nav += '</ul>';

            $("#main_nav").html(main_nav);

            $('.menu').click(function(arg) {
                var id=$(this).attr("id");
                $.cookies.set("sel_menu", id);
                $('.menu').removeClass('active');
                $('#' + id).addClass("active");
                switch (id) {
                    case 'index':
                        $('#main').html("<iframe scrolling='auto' src='help.html'></iframe>");
                        break;
                    case 'mail':
                        $('#main').html("<iframe scrolling='auto' src='mail.html'></iframe>");
                        break;
                    case 'gift':
                        $('#main').html("<iframe scrolling='auto' src='gift.html'></iframe>");
                        break;
                    case 'user_manager':
                        $('#main').html("<iframe scrolling='auto' src='user.html'></iframe>");
                        break;
                    case 'role':
                        $('#main').html("<iframe scrolling='auto' src='role.html'></iframe>");
                        break;
                    case 'pack':
                        $('#main').html("<iframe scrolling='auto' src='pack.html'></iframe>");
                        break;
                    case 'arena':
                        $('#main').html("<iframe scrolling='auto' src='arena.html'></iframe>");
                        break;
                    case 'arena_robot':
                        $('#main').html("<iframe scrolling='auto' src='arena_robot.html'></iframe>");
                        break;
                    case 'zone':
                        $('#main').html("<iframe scrolling='auto' src='zone.html'></iframe>");
                        break;
                    case 'server':
                        $('#main').html("<iframe scrolling='auto' src='server.html'></iframe>");
                        break;
                    case 'notice':
                        $('#main').html("<iframe scrolling='auto' src='notice.html'></iframe>");
                        break;
                    case 'marquee':
                        $('#main').html("<iframe scrolling='auto' src='marquee.html'></iframe>");
                        break;
                    case 'server_tool':
                        $('#main').html("<iframe scrolling='auto' src='server_tool.html'></iframe>");
                        break;
                    case 'activity':
                        $('#main').html("<iframe scrolling='auto' src='activity.html'></iframe>");
                        break;
                    case 'client_tool':
                        $('#main').html("<iframe scrolling='auto' src='client_tool.html'></iframe>");
                        break;
                }
            });

            initServerList();

            $('#server_list').change(function() {
                $("#server_state").html("正在连接到...");
                var server_id =  $('#server_list').val();
                $.cookies.set("sel_server", server_id);
                //连接对应的socket
                connectServer(server_id);
            });

            //var server_id = $.cookies.get('sel_server');
            //if (server_id != null) {
            //    connectServer(server_id);
             //   $.cookies.set("sel_server", 1);
           // }

            $('#activity').click();

            $("#caret").html(username + "的信息");
        }, "json");

        //清除没用的cookies
//        $.cookies.del("view_roleid");
    }, "text");
});


