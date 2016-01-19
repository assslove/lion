$(document).ready(function(){
    var username = $.cookies.get("username");
    $.post('/gm/login/check', { //检查用户是否验证通过
        username : username
    }, function(data) {
        if (data === "0") {
            window.location.href = "login.html";
            return;
        }

        $.post('/gm/gm_role/perm', { //获取用户权限
            username: username
        }, function (data) {
            $.cookies.set("role_config", data);

            var main_nav = '<ul class="nav nav-sidebar">' +
                '<li id="index" class="menu active"><a href="#">首页</a></li>';

            for (var i in MODELS) {
                if (data.length == 0 || data[parseInt(i)-1] != 0) {
                    main_nav += '<li id="' + MODELS[i].name + '" class="menu"><a href="#">' + MODELS[i].desc + '</a></li>';
                }
            }
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
                    case 'tool':
                        $('#main').html("<iframe scrolling='auto' src='tool.html'></iframe>");
                        break;
                    case 'sysmail':
                        $('#main').html("<iframe scrolling='auto' src='sysmail.html'></iframe>");
                        break;
                    case 'user':
                        $('#main').html("<iframe scrolling='auto' src='user.html'></iframe>");
                        break;
                }
            });

            $('#index').click();
            $("#caret").html(username + "的信息");
            var password_need_fix  = $.cookies.get('password_need_fix');
            if (password_need_fix == 1) {
                $("#user_info").modal({backdrop: 'static', keyboard: false});
            }

        });
    });



});


function checkPasswd(passwd)
{
    if (passwd.length < 8) {
        return false;
    }

    var flag = 0;
    for (var i in passwd) {
        var code = passwd.charCodeAt(i);
        if (code >= 48 && code <= 57) flag = flag | 0x1;
        else if (code >= 65 && code <= 90) flag = flag | 0x2;
        else if (code >= 97 && code <= 122) flag = flag | 0x2;
        else flag = flag | 0x4;
    }

    return flag == 7;
}

function savePassword() {
    var oldPassword = $('#oldPassword').val();
    var newPassword = $('#newPassword').val();
    var rePassword = $('#rePassword').val();

    if (!checkPasswd(newPassword)) {
        alert("密码不合法,长度不小于8位,包含字母.数字和特殊符号");
        return;
    }

    if (newPassword != rePassword) {
        alert("二次输入密码不一致");
        return;
    }

    $.ajax({
        url: "/gm/gm_user/change",
        type: "POST",
        data: {
            username: $.cookies.get('username'),
            password: newPassword,
            old_password: oldPassword
        },
        success: function (res) {
            if (res == 1) {
                //    alert("修改密码成功");
            } else {
                alert("修改密码失败");
            }
            $('#user_info').modal('toggle');

            window.location.href = "login.html";
        }
    });
}

function logout()
{
    $.post("/gm/logout", {}, function(data) {
        window.location.href = "login.html";
        $.cookies.clear("username");
    }, "text");
}

