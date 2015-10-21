$(document).ready(function(){
    var main_nav = '<ul class="nav nav-sidebar">' +
        '<li id="index" class="menu active"><a href="#">首页</a></li>';

    for (var i in MODELS) {
        main_nav +='<li id="'+MODELS[i].name+'" class="menu"><a href="#">'+MODELS[i].desc+'</a></li>';
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
        }
    });

    $('#tool').click();
});


