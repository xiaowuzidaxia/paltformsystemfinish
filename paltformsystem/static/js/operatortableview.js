jQuery(document).ready(function () {

    $('.loginForm form').submit(function () {
        var companyname = $(this).find('#companyname').val();
        var username = $(this).find('#username').val();
        var password = $(this).find('#password').val();
        if (companyname == '') {
            $(this).find('.error').fadeOut('fast', function () {
                $(this).css('top', '169px');
            });

            $(this).find('.error').fadeIn('fast', function () {
                $(this).parent().find('#companyname').focus();
            });
            return false;
        }
        if (username == '') {
            $(this).find('.error').fadeOut('fast', function () {
                $(this).css('top', '225px');
            });
            $(this).find('.error').fadeIn('fast', function () {
                $(this).parent().find('#username').focus();
            });
            return false;
        }
        if (password == '') {
            $(this).find('.error').fadeOut('fast', function () {
                $(this).css('top', '283px');
            });
            $(this).find('.error').fadeIn('fast', function () {
                $(this).parent().find('#password').focus();
            });
            return false;
        }
    });

    $('.loginForm form #companyname, .loginForm form #username, .loginForm form #password').keyup(function () {
        $('#errordiscb').text("");
        $(this).parent().find('.errorcode').fadeOut('fast');
        $(this).parent().find('.error').fadeOut('fast');
    });

});

$(document).ready(function () {
    if ($.cookie("rmbUser") == "true") {
    $("#logincheckbox").attr("checked", true);
    $("#companyname").val($.cookie("companyname"));
    $("#username").val($.cookie("username"));
    $("#password").val($.cookie("password"));
    }
});

function Save() {
    if ($("#logincheckbox").attr("checked")) {
        var str_companyname = $("#companyname").val();
        var str_username = $("#username").val();
        var str_password = $("#password").val();
        $.cookie("rmbUser", "true", { expires: 7 }); 
        $.cookie("companyname", str_companyname, { expires: 7 });
        $.cookie("username", str_username, { expires: 7 });
        $.cookie("password", str_password, { expires: 7 });
    }
    else {
        $.cookie("rmbUser", "false", { expire: -1 });
        $.cookie("companyname", "", { expires: -1 });
        $.cookie("username", "", { expires: -1 });
        $.cookie("password", "", { expires: -1 });
    }
};

function rmblogin(){
    if ($("#logincheckbox").attr("checked")){
        $("#logincheckbox").removeAttr("checked");
    }
    else{
        $("#logincheckbox").attr("checked",'true');
    }
}