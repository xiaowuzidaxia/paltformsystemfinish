jQuery(document).ready(function () {

    $('.contact-form form').submit(function () {
        var resetpassword = $(this).find('#resetpassword').val();
        var reenterpassword = $(this).find('#reenterpassword').val();
        if (resetpassword == '') {
            $('#resetpasswordcss').addClass("has-warning");
            $(this).parent().find('#resetpassword').focus();
            return false;
        }
        if (reenterpassword == '') {
            $('#reenterpasswordcss').addClass("has-warning");
            $(this).parent().find('#reenterpassword').focus();
            return false;
        }
        if (resetpassword != reenterpassword) {
            $('#errordiscb').text("密码确认输入有误！");
            $('#reenterpasswordcss').addClass("has-warning");
            $(this).parent().find('#reenterpassword').focus();
            return false;
        }
    });
    $('.contact-form form #resetpassword').keyup(function () {
        $('#resetpasswordcss').removeClass("has-warning");
        $('#reenterpassword').val("");
        $('#errordiscb').text("");
    });
    $('.contact-form form #reenterpassword').keyup(function () {
        $('#reenterpasswordcss').removeClass("has-warning");
        $('#errordiscb').text("");
    });
    var companyname;
    var username;
    /*$.ajax({
        url: '/webmc/getforgetpassworduserinfo/',//用户公司名称，用户名
        type: 'GET',
        success: function (argv) {
            console.log(argv);
            var obj = jQuery.parseJSON(argv);
            companyname = obj.companyname;
            username = obj.username;
        }
    });*/
});
