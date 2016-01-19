/**
 * Created by bin.hou on 2015/5/29.
 */
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

function login()
{
    var username = $("#username").val();
    var password = $("#password").val();

    if (username == "" || password == "") {
        alert("用户名与密码不能为空")
        return ;
    }

    if (username == password) {
        $.cookies.set("password_need_fix", 1);
    } else {
        $.cookies.set("password_need_fix", 0);
    }

    if (!checkPasswd(password)) {
        $.cookies.set("password_need_fix", 1);
    }

    $.get('/gm/login', {
        username : username,
        password : password
    }, function(data) {
        if (data == "1") {
            $.cookies.set("username", username);
            window.location.href = "gm.html";
        } else {
            alert("登录失败");
        }
    }, "text");
}


$(document).ready(function() {
    $("#password").keydown(function(e) {
        if (e.keyCode === 13) {
            login();
        }
    });
});
