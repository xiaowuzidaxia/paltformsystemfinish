jQuery(document).ready(function () {

    $('.contact-form form').submit(function () {
        var companyname = $(this).find('#companyname').val();
        var username = $(this).find('#username').val();
        var phonenum = $(this).find('#phonenum').val();
        var vecode = $(this).find('#vecode').val();
        var vecodetmp = $(this).find('#vecodetmp').val();
        if (companyname == '') {
            $('#companynamecss').addClass("has-warning");
            $(this).parent().find('#companyname').focus();
            return false;
        }
        if (username == '') {
            $('#usernamecss').addClass("has-warning");
            $(this).parent().find('#username').focus();
            return false;
        }
        if (phonenum == '') {
            $('#phonenumcss').addClass("has-warning");
            $(this).parent().find('#phonenum').focus();
            return false;
        }
        if (vecode == '') {
            $('#vecodecss').addClass("has-warning");
            $(this).parent().find('#vecode').focus();
            return false;
        }
        if (vecode != vecodetmp) {
            $('#errordiscb').text("验证码输入有误！");
            $('#vecodecss').addClass("has-warning");
            $(this).parent().find('#vecode').focus();
            return false;
        }
    });
    $('.contact-form form #companyname').keyup(function () {
        $('#companynamecss').removeClass("has-warning");
        $('#errordiscb').text("");
    });
    $('.contact-form form #username').keyup(function () {
        $('#usernamecss').removeClass("has-warning");
        $('#errordiscb').text("");
    });
    $('.contact-form form #phonenum').keyup(function () {
        $('#phonenumcss').removeClass("has-warning");
        $('#errordiscb').text("");
    });
    $('.contact-form form #vecode').keyup(function () {
        $('#vecodecss').removeClass("has-warning");
        $('#errordiscb').text("");
    });
    getvecodetmp();
});

function getvecodetmp() {
    var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    var pos, range = 4;
    var codetmp="";
    for (var i = 0; i < range; i++) {
        pos = Math.round(Math.random() * (arr.length - 1));
        codetmp += arr[pos];
    }
    $('#vecodetmp').val(codetmp);
}


/*function resetpassword(){
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
    var data = {'companyname':companyname,'username':username,'resetpassword':resetpassword};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/webmc/resetpassword/',
        type: 'POST',
        data:{dat:temp},
        success: function (argv) {
            console.log(argv);
        }
    });
}*/