var companyname;
var username;

jQuery(document).ready(function () {
    $.ajax({
        url: '/dev/U/getloginuserinfo/',//用户公司名称，用户名
        type: 'GET',
        success: function (argv) {
            console.log(argv);
            //var obj = jQuery.parseJSON(argv);
            companyname = argv.companyname;
            username = argv.username;
            $('#username').html(username);
            tablerefreshfun(managerDevTableCurpage,managertablepagerows,"managerDevtable");
            tablerefreshfun(managerEmployeTableCurpage,managertablepagerows,"managerEmployetable");
            getUserDevNamefun("username","init");
        }
    });
    $('#loginpassword').keyup(function () {
        $('#loginpasswordcss').removeClass("has-warning");
        $('#chloginpwerrordiscb').text("");
    });
    $('#changeloginpassword').keyup(function () {
        $('#changeloginpasswordcss').removeClass("has-warning");
        $('#chloginpwerrordiscb').text("");
    });
    $('#reenterloginpassword').keyup(function () {
        $('#reenterloginpasswordcss').removeClass("has-warning");
        $('#chloginpwerrordiscb').text("");
    });
    $('#operatepassword').keyup(function () {
        $('#operatepasswordcss').removeClass("has-warning");
        $('#choperatepwerrordiscb').text("");
    });
    $('#changeoperatepassword').keyup(function () {
        $('#changeoperatepasswordcss').removeClass("has-warning");
        $('#choperatepwerrordiscb').text("");
    });
    $('#reenteroperatepassword').keyup(function () {
        $('#reenteroperatepasswordcss').removeClass("has-warning");
        $('#choperatepwerrordiscb').text("");
    });

});
//修改登录密码
function changeloginpasswordfun(){
    var loginpassword = $('#loginpassword').val();
    var changeloginpassword = $('#changeloginpassword').val();
    var reenterloginpassword = $('#reenterloginpassword').val();
    if (loginpassword == '') {
        $('#loginpasswordcss').addClass("has-warning");
        $('#loginpassword').focus();
        return false;
    }
    if (changeloginpassword == '') {
        $('#changeloginpasswordcss').addClass("has-warning");
        $('#changeloginpassword').focus();
        return false;
    }
    if (reenterloginpassword == '') {
        $('#reenterloginpasswordcss').addClass("has-warning");
        $('#reenterloginpassword').focus();
        return false;
    }
    if (reenterloginpassword != changeloginpassword) {
        $('#chloginpwerrordiscb').text("密码确认输入有误！");
        $('#chloginpwerrordiscb').removeClass("suc");
        $('#chloginpwerrordiscb').addClass("fail");
        $('#reenterloginpasswordcss').addClass("has-warning");
        $('#reenterloginpassword').focus();
        return false;
    }
    var modetype = 'changeloginpassword';
    var data = {'modetype':modetype,'companyname':companyname,'username':username,'loginpassword':loginpassword,'resetloginpassword':reenterloginpassword};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/dev/U/changepassword/',
        type: 'POST',
        data:{dat:temp},
        success: function (obj) {
            //var obj = jQuery.parseJSON(argv);
            $('#chloginpwerrordiscb').text(obj.discb);
            if(obj.discbcss=="suc"){
                $('#chloginpwerrordiscb').removeClass("fail");
                $('#chloginpwerrordiscb').addClass("suc");
            }else if(obj.discbcss=="fail"){
                $('#chloginpwerrordiscb').removeClass("suc");
                $('#chloginpwerrordiscb').addClass("fail");
            }
            //window.location.reload();
        }
    });
}
//重置登录密码
function clearchangeloginpasswordfun()
{
    $('#loginpassword').val("");
    $('#changeloginpassword').val("");
    $('#reenterloginpassword').val("");
    $('#loginpasswordcss').removeClass("has-warning");
    $('#changeloginpasswordcss').removeClass("has-warning");
    $('#reenterloginpasswordcss').removeClass("has-warning");
    $('#chloginpwerrordiscb').text("");
}
//修改操作密码
function changeoperatepasswordfun(){
    var operatepassword = $('#operatepassword').val();
    var changeoperatepassword = $('#changeoperatepassword').val();
    var reenteroperatepassword = $('#reenteroperatepassword').val();
    if (operatepassword == '') {
        $('#operatepasswordcss').addClass("has-warning");
        $('#operatepassword').focus();
        return false;
    }
    if (changeoperatepassword == '') {
        $('#changeoperatepasswordcss').addClass("has-warning");
        $('#changeoperatepassword').focus();
        return false;
    }
    if (reenteroperatepassword == '') {
        $('#reenteroperatepasswordcss').addClass("has-warning");
        $('#reenteroperatepassword').focus();
        return false;
    }
    if (reenteroperatepassword != changeoperatepassword) {
        $('#choperatepwerrordiscb').text("密码确认输入有误！");
        $('#choperatepwerrordiscb').removeClass("suc");
        $('#choperatepwerrordiscb').addClass("fail");
        $('#reenteroperatepasswordcss').addClass("has-warning");
        $('#reenteroperatepassword').focus();
        return false;
    }
    var modetype = 'changeoperatepassword';
    var data = {'modetype':modetype,'companyname':companyname,'username':username,'loginpassword':operatepassword,'resetloginpassword':reenteroperatepassword};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/dev/U/changepassword/',
        type: 'POST',
        data:{dat:temp},
        success: function (obj) {
            //var obj = jQuery.parseJSON(argv);
            $('#choperatepwerrordiscb').text(obj.discb);
            if(obj.discbcss=="suc"){
                $('#choperatepwerrordiscb').removeClass("fail");
                $('#choperatepwerrordiscb').addClass("suc");
            }else if(obj.discbcss=="fail"){
                $('#choperatepwerrordiscb').removeClass("suc");
                $('#choperatepwerrordiscb').addClass("fail");
            }
        }
    });
}
//重置操作密码
function clearchangeoperatepasswordfun()
{
    $('#operatepassword').val("");
    $('#changeoperatepassword').val("");
    $('#reenteroperatepassword').val("");
    $('#operatepasswordcss').removeClass("has-warning");
    $('#changeoperatepasswordcss').removeClass("has-warning");
    $('#reenteroperatepasswordcss').removeClass("has-warning");
    $('#choperatepwerrordiscb').text("");
}
//提交建议
function postusermessagefun()
{
    var usermessage = $('#usermessage').val();
    var CurDate = new Date();
    var CurDateTime = CurDate.toLocaleDateString() + CurDate.toLocaleTimeString();  
    var data = {'companyname':companyname,'username':username,'CurDateTime':CurDateTime,'usermessage':usermessage};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/dev/U/usermessage/',
        type: 'POST',
        data:{dat:temp},
        success: function (obj) {
            //var obj = jQuery.parseJSON(argv);
            console.log(obj);
            if(obj.discbcss=="suc"){
                $('#myModelBodyDiv').removeClass("fail");
                $('#myModelBodyDiv').addClass("suc");
                $('#myModaltitleLabel').text('提交建议');
                document.getElementById("myModelBodyDiv").innerHTML=obj.discb;
                document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" data-dismiss="modal" onclick="clearusermessagefun();">关闭</button>';
                document.getElementById("buttonmodel").click();
            }
            
        }
    });
}
//清空建议
function clearusermessagefun(){
    $('#myModelBodyDiv').removeClass("fail");
    $('#myModelBodyDiv').removeClass("suc");
    $('#usermessage').val('');
}
//清空表
function managertableclearfun(table){
    var rowlen = document.getElementById(table).rows.length;
    for (var i = 0; i < rowlen; i++) {
        document.getElementById(table).deleteRow(0);
    };
}

//清空模态样式
function clearmodelcssfun(){
    $('#myModelBodyDiv').removeClass("fail");
    $('#myModelBodyDiv').removeClass("suc");
}


var managerDevnumber = new Array();
var managerDevRownumber = new Array();
var managerDevTableobj = {"managerDevnumber":managerDevnumber, "managerDevRownumber":managerDevRownumber};

var managerEmployename = new Array();
var managerEmployeRownumber = new Array();
var managerEmployeTableobj = {"managerEmployename":managerEmployename, "managerEmployeRownumber":managerEmployeRownumber};

var managerDevTableCurpage = 1;
var managerEmployeTableCurpage = 1;
var managerDevTableTotalpage = 1;
var managerEmployeTableTotalpage = 1;
var managertablepagerows = 2;

var gDeviceCode = new Array();
var gDevRunstateCode = new Array();
var gDevRunProgressCode = new Array();
var gDevRunProgressdis = new Array();
var gDevProcessDsc = new Array();

//刷新表
function tablerefreshfun(jumppage,pagerows,tabletype){
    if(tabletype=="managerDevtable"){
        if(jumppage > managerDevTableTotalpage || jumppage < 1){
            return false;
        }
    }else if(tabletype=="managerEmployetable"){
        if(jumppage > managerEmployeTableTotalpage || jumppage < 1){
            return false;
        }
    }
    var data = {'companyname':companyname,'username':username,'jumppage':jumppage,'pagerows':pagerows,'tabletype':tabletype};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/dev/U/getpage/',
        type: 'POST',
        data:{dat:temp},
        //contentType: "application/json; charset=utf-8",
        success: function (obj) {
            //console.log(argv);
            //var obj = jQuery.parseJSON(argv);
            console.log(obj);
            if(obj.tabletype=="managerDevtable"){
                managerDevTableCurpage = jumppage;
                managerdevtablerefreshfun(obj);
            }else if(obj.tabletype=="managerEmployetable"){
                managerEmployeTableCurpage = jumppage;
                manageremployetablerefreshfun(obj);
            }
        }
    });
}


//刷新设备表
function managerdevtablerefreshfun(obj){
    var z = 0;
    managerDevnumber.splice(0,managerDevnumber.length);
    managerDevRownumber.splice(0,managerDevRownumber.length);
    managertableclearfun("managerdevicetable");
    managerDevTableTotalpage = obj.tabletotalpage;
    tablepagebtnfun(managerDevTableCurpage,managerDevTableTotalpage,"managerdevtable");
    gDeviceCode = [];
    gDevRunstateCode = [];
    gDevRunProgressCode = [];
    gDevRunProgressdis = [];
    gDevProcessDsc = [];
    for (var i = 0; i < obj.number.length; i++) {
        managerDevnumber.push(obj.devicecode[i]);
        managerDevRownumber.push(i);


        gDeviceCode.push(obj.devicecode[i]);
        gDevRunstateCode.push(obj.devicerunstatecode[1][i]);
        gDevRunProgressCode.push(obj.devicerunprogresscode[1][i]);
        gDevRunProgressdis.push(obj.devicerunprogresscode[0][i]);
        gDevProcessDsc.push(-1);


        z = document.getElementById("managerdevicetable").rows.length;
        var tableRow=document.getElementById("managerdevicetable").insertRow(z);
        var Cell_0=tableRow.insertCell(0);
        Cell_0.innerHTML = obj.number[i];
        Cell_0.id = "managerDevRownumber" + i;
        var Cell_1= tableRow.insertCell(1);
        Cell_1.innerHTML = obj.devicecode[i];
        Cell_1.id = "managerDevnumber" + i;
        var Cell_2 = tableRow.insertCell(2);
        Cell_2.innerHTML = obj.devicename[i];
        Cell_2.id = "managerDevname" + i;
        var Cell_3=tableRow.insertCell(3);
        Cell_3.innerHTML = obj.devicelifestatecode[i];
        Cell_3.id = "managerDevlifestate" + i;
        var Cell_4=tableRow.insertCell(4);
        Cell_4.innerHTML = obj.devicerunstatecode[0][i];
        Cell_4.id = "managerDevRunstate" + i;

        var Cell_5=tableRow.insertCell(5);
        //Cell_5.innerHTML = obj.devicerunprogresscode[i];
        Cell_5.innerHTML = '<div class="progress" style="width:80px">'+//obj.devicerunprogresscode[i];
        '<span style="z-index:1; position:absolute; color:black; line-height:30px;" id="DevRunprogressTxt'+i+'">'+obj.devicerunprogresscode[1][i]+'%: '+obj.devicerunprogresscode[0][i]+'</span>'+
        '<div class="progress-bar progress-bar-success" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width:'+obj.devicerunprogresscode[1][i]+'%;" id="DevRunprogressPar'+i+'">'+
        '</div></div>';
        Cell_5.id = "managerDevRunprogress" + i;
        var Cell_6 = tableRow.insertCell(6);
        Cell_6.innerHTML = obj.devicedaysucoperatesum[i];
        Cell_6.id = "managerDevDaySucOperatesum" + i;
        var Cell_7=tableRow.insertCell(7);
        Cell_7.innerHTML = obj.devicedayfailoperatesum[i];
        Cell_7.id = "managerDevDayFailOperatesum" + i;

        var Cell_8= tableRow.insertCell(8);
        Cell_8.innerHTML = obj.devicedayworktime[i];
        Cell_8.id = "managerDevDayWorktime" + i;

        var Cell_9=tableRow.insertCell(9);
        var lentmp=obj.deviceemployename[i].length;
        var deviceemployenametmp; 
        if(lentmp>1){
            deviceemployenametmp = "<select>";
            for (var j = 0; j < lentmp; j++) {
                deviceemployenametmp = deviceemployenametmp + '<option>' +  obj.deviceemployename[i][j] + '</option>';
            }; 
            deviceemployenametmp = deviceemployenametmp + '</select>';
            Cell_9.innerHTML = deviceemployenametmp;
        }else if(lentmp==1){
            Cell_9.innerHTML = obj.deviceemployename[i][0];
        }
        console.log(lentmp);
        
        Cell_9.id = "managerDevEmployename" + i;

        var Cell_10= tableRow.insertCell(10);
        Cell_10.innerHTML = obj.devicecuroperator[i];
        Cell_10.id = "managerDevCurOperator" + i;

        var Cell_11=tableRow.insertCell(11);
        Cell_11.innerHTML = '<div class="visible-md visible-lg hidden-sm hidden-xs btn-group">'+
                                    '<button class="btn btn-xs btn-success miconbtn hide" id="managertableOkbtn' + i + '" title="确定" onclick="Okeditmanagertablefun('+ i +');">'+
                                        '<span class="glyphicon glyphicon-ok"></span>'+
                                    '</button>'+
                                    '<button class="btn btn-xs btn-danger miconbtn hide" id="managertableCancelbtn' + i + '" title="取消" onclick="Canceleditmanagertablefun('+ i +');">'+
                                        '<span class="glyphicon glyphicon-remove"></span>'+
                                    '</button>'+

                                    '<button class="btn btn-xs btn-info miconbtn" id="managertableEditbtn' + i + '" title="编辑" onclick="editmanagertablefun(' + i + ');">'+
                                        '<span class="glyphicon glyphicon-edit "></span>'+
                                    '</button>'+
                                    '<button class="btn btn-xs btn-success miconbtn" id="managertableViewDevInfobtn' + i + '" title="查看设备信息" onclick="managertableDevInfofun(' + i + ');">'+
                                        '<span class="glyphicon glyphicon-zoom-in"</span>'+
                                    '</button>'+
                                    '<button class="btn btn-xs btn-info miconbtn" id="managertableGetOperateRightbtn' + i + '" title="获取操作权限" onclick="devgetoperaterightfun(' + i + ');">'+
                                        '<span class="glyphicon glyphicon-hand-up"></span><span class="glyphicon  glyphicon-transfer"></span>'+
                                    '</button>'+
                                    '<button class="btn btn-xs btn-primary miconbtn" id="managertableEnterDevControlbtn' + i + '" title="进入控制面板" onclick="managertableEnterDevControlfun(' + i + ');">'+
                                        '<span class="glyphicon glyphicon-hand-up"></span><span class="glyphicon glyphicon-wrench"></span>'+
                                    '</button>'+
                                '</div>'+

                                '<div class="visible-xs visible-sm hidden-md hidden-lg">'+
                                    '<div class="btn-group dropdown">'+
                                        '<button class="btn btn-primary dropdown" data-toggle="dropdown">'+
                                            '<span class="glyphicon glyphicon-th-list"></span>'+
                                            '<span class="caret"></span>'+
                                        '</button>'+
                                        '<ul class="dropdown-menu dropdown-close">'+
                                            '<li class="hide" id="managertableOkli' + i + '">'+
                                                '<button class="btn btn-xs btn-success miconbtn" title="确定" onclick="Okeditmanagertablefun('+ i +');">'+
                                                    '<span class="glyphicon glyphicon-ok"></span>'+
                                                '</button>'+
                                            '</li>'+
                                            '<li class="hide" id="managertableCancelli' + i + '">'+
                                                '<button class="btn btn-xs btn-danger miconbtn" title="取消" onclick="Canceleditmanagertablefun('+ i +');">'+
                                                    '<span class="glyphicon glyphicon-remove"> </span>'+
                                                '</button>'+
                                            '</li>'+
                                            '<li id="managertableEditli' + i + '">'+
                                                '<button class="btn btn-xs btn-info miconbtn" title="编辑" onclick="editmanagertablefun(' + i + ');">'+
                                                    '<span class="glyphicon glyphicon-edit"></span>'+
                                                '</button>'+
                                            '</li>'+
                                            '<li id="managertableViewDevInfoli' + i + '">'+
                                                '<button class="btn btn-xs btn-success miconbtn" title="查看设备信息" onclick="managertableDevInfofun(' + i + ');">'+
                                                    '<span class="glyphicon glyphicon-zoom-in"></span>'+
                                                '</button>'+
                                            '</li>'+
                                            '<li id="managertableGetOperateRightli' + i + '">'+
                                                '<button class="btn btn-xs btn-info miconbtn" title="获取操作权限" onclick="devgetoperaterightfun(' + i + ');">'+
                                                    '<span class="glyphicon glyphicon-hand-up"></span><span class="glyphicon  glyphicon-transfer"></span>'+
                                                '</button>'+
                                            '</li>'+
                                            '<li id="managertableEnterDevControlli' + i + '">'+
                                                '<button class="btn btn-xs btn-primary miconbtn" title="进入控制面板" onclick="managertableEnterDevControlfun(' + i + ');">'+
                                                    '<span class="glyphicon glyphicon-hand-up"></span><span class="glyphicon glyphicon-wrench"></span>'+
                                                '</button>'+
                                            '</li>'+
                                        '</ul>'+
                                    '</div>'+
                                '</div>';
        Cell_11.id = "managerDevTablebtn" + i;
        if(obj.devicerunstatecode[1][i]>20000){
            document.getElementById("managerDevRunstate"+i).innerHTML=obj.devicerunstatecode[0][i];+' code:'+obj.devicerunstatecode[1][i];
        }
    };
    managerDevTableobj = {"managerDevnumber":managerDevnumber, "managerDevRownumber":managerDevRownumber};
}

//表格翻页
function tablepagebtnfun(curpage,totalpage,table){
    if(curpage < 0){
        return false;
    }
    var tablepage = "#" + table + "page";
    $(tablepage + "up").removeClass('disabled');
    $(tablepage + "down").removeClass('disabled');
    if(curpage == 1){
        $(tablepage + "up").addClass('disabled');
    }
    if(curpage>=totalpage){
        $(tablepage + "down").addClass('disabled');
    }
}

//获取设备控制权限
function devgetoperaterightfun(num){
    $('#myModaltitleLabel').text('获取设备操作权限');
    document.getElementById("myModelBodyDiv").innerHTML = '<div class="row"><div class="col-md-9 col-md-offset-1"><form class="form-horizontal" role="form">'+
                                                          '<div class="errorcode text-center"><span id="managergetoperatepwerrordiscb"></span></div><br />'+
                                                          '<div class="form-group" id="managergetoperatepwcss"><label class="col-sm-4 control-label">操作密码</label><div class="col-sm-8"><input class="form-control" id="managergetoperatepw" type="password"></div></div>'+
                                                          '</form></div> </div>';
    document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" onclick="postdevgetoperaterightfun('+num+');">提交</button> <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
    document.getElementById("buttonmodel").click();
}

//提交设备控制权操作密码
function postdevgetoperaterightfun(num){
    var operatepassword = $('#managergetoperatepw').val();
    $('#managergetoperatepw').keyup(function () {
        $('#managergetoperatepwcss').removeClass("has-warning");
        $('#managergetoperatepwerrordiscb').text("");
    });
    if (operatepassword == '') {
        $('#managergetoperatepwcss').addClass("has-warning");
        $('#managergetoperatepw').focus();
        return false;
    }
    num = $("#managerDevnumber" + num).text();
    var data = {'companyname':companyname,'username':username,'operatepassword':operatepassword,'devicecode':num};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/dev/U/operateright/',
        type: 'POST',
        data:{dat:temp},
        success: function (obj) {
            //var obj = jQuery.parseJSON(argv);
            $('#managergetoperatepwerrordiscb').text(obj.discb);
            if(obj.discbcss=="suc"){
                $('#managergetoperatepwerrordiscb').removeClass("fail");
                $('#managergetoperatepwerrordiscb').addClass("suc");
            }else if(obj.discbcss=="fail"){
                $('#managergetoperatepwerrordiscb').removeClass("suc");
                $('#managergetoperatepwerrordiscb').addClass("fail");
            }
        }
    });
}

//编辑设备名称
var managerDevnameipttext;
function editmanagertablefun(rownumber){
    managerDevnameipttext = $("#managerDevname" + rownumber).text();
    document.getElementById("managerDevname" + rownumber).innerHTML = '<input id="managerDevnameipt' + rownumber + '" value="'+ managerDevnameipttext + '" style="width:100px;"/>';
    $("#managerDevnameipt" + rownumber).focus();
    $("#managertableOkbtn" + rownumber).removeClass('hide');
    $("#managertableCancelbtn" + rownumber).removeClass('hide');
    $("#managertableOkli" + rownumber).removeClass('hide');
    $("#managertableCancelli" + rownumber).removeClass('hide');
    $("#managertableEditbtn" + rownumber).addClass('hide');
    $("#managertableViewDevInfobtn" + rownumber).addClass('hide');
    $("#managertableEnterDevControlbtn" + rownumber).addClass('hide');
    $("#managertableOkli" + rownumber).removeClass('hide');
    $("#managertableCancelli" + rownumber).removeClass('hide');
    $("#managertableEditli" + rownumber).addClass('hide');
    $("#managertableGetOperateRightbtn" + rownumber).addClass('hide');
    $("#managertableGetOperateRightli" + rownumber).addClass('hide');
    $("#managertableViewDevInfoli" + rownumber).addClass('hide');
    $("#managertableEnterDevControlli" + rownumber).addClass('hide');
}

//确认编辑
function Okeditmanagertablefun(rownumber){
    var tabletype = "managerDevtable";
    var managerDevtableItemtitle = new Array();
    managerDevtableItemtitle[0] = "设备名称";
    var managerDevtableItemtext = new Array(); 
    managerDevtableItemtext[0] = $("#managerDevnameipt" + rownumber).val();
    var managerDevnumbertmp = $("#managerDevnumber" + rownumber).text();
    //更改为数组第一个数
    var data = {'devicecode':managerDevnumbertmp,'tabletype':tabletype,'tableItemtitle':managerDevtableItemtitle[0],'tableItemtext':managerDevtableItemtext[0]};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/dev/U/editdevname/',
        type: 'POST',
        data:{dat:temp},
        success: function (argv) {
            console.log(argv);
            document.getElementById("managerDevname" + rownumber).innerHTML = $("#managerDevnameipt" + rownumber).val();
            $("#managertableOkbtn" + rownumber).addClass('hide');
            $("#managertableCancelbtn" + rownumber).addClass('hide');
            $("#managertableEditbtn" + rownumber).removeClass('hide');
            $("#managertableViewDevInfobtn" + rownumber).removeClass('hide');
            $("#managertableEnterDevControlbtn" + rownumber).removeClass('hide');
            $("#managertableOkli" + rownumber).addClass('hide');
            $("#managertableCancelli" + rownumber).addClass('hide');
            $("#managertableEditli" + rownumber).removeClass('hide');
            $("#managertableViewDevInfoli" + rownumber).removeClass('hide');
            $("#managertableGetOperateRightbtn" + rownumber).removeClass('hide');
            $("#managertableGetOperateRightli" + rownumber).removeClass('hide');
            $("#managertableEnterDevControlli" + rownumber).removeClass('hide');
        }
    });
}

//取消编辑
function Canceleditmanagertablefun(rownumber){
    document.getElementById("managerDevname" + rownumber).innerHTML = managerDevnameipttext;
    $("#managertableOkbtn" + rownumber).addClass('hide');
    $("#managertableCancelbtn" + rownumber).addClass('hide');
    $("#managertableEditbtn" + rownumber).removeClass('hide');
    $("#managertableViewDevInfobtn" + rownumber).removeClass('hide');
    $("#managertableEnterDevControlbtn" + rownumber).removeClass('hide');
    $("#managertableOkli" + rownumber).addClass('hide');
    $("#managertableCancelli" + rownumber).addClass('hide');
    $("#managertableEditli" + rownumber).removeClass('hide');
    $("#managertableViewDevInfoli" + rownumber).removeClass('hide');
    $("#managertableGetOperateRightbtn" + rownumber).removeClass('hide');
    $("#managertableGetOperateRightli" + rownumber).removeClass('hide');
    $("#managertableEnterDevControlli" + rownumber).removeClass('hide');
}

//查看设备信息
function managertableDevInfofun(rownumber){
    var managerDevnumbertmp = $("#managerDevnumber" + rownumber).text();
    $.ajax({
        url:('/dev/U/devinfo/'+ managerDevnumbertmp),
        type:'GET',
        success:function(obj){
            //var obj = jQuery.parseJSON(argv);
            console.log(obj);
            $('#myModaltitleLabel').text(obj.devname + ' 的设备信息');
            document.getElementById("myModelBodyDiv").innerHTML = '<div class="row"><div class="col-md-9 col-md-offset-1"><form class="form-horizontal" role="form">'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">设备类型</label><div class="col-sm-8"><span class="form-control">' + obj.devtype + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">出厂日期</label><div class="col-sm-8"><span class="form-control">' + obj.devdeliverydate + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">有效期</label><div class="col-sm-8"><span class="form-control">' + obj.devexpirydate + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">累计工作时长(时)</label><div class="col-sm-8"><span class="form-control">' + obj.devetotalworktime + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">月成品数(个)</label><div class="col-sm-8"><span class="form-control">' + obj.devmonthsucoperatesum + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">月废品数(个)</label><div class="col-sm-8"><span class="form-control">' + obj.devmonthfailoperatesum + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">累计成品数(个)</label><div class="col-sm-8"><span class="form-control">' + obj.devtotalsucoperatesum + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">累计废品数(个)</label><div class="col-sm-8"><span class="form-control">' + obj.devtotalfailoperatesum + '</span></div></div>'+
                                                                  '</form></div> </div>';
            document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
            document.getElementById("buttonmodel").click();
        }
    });
}


var gCurOpenDevtype;
var gCurOpenDevcode;
var gCurOpenDevShowtype;
var gCurOpenRownum;
//进入设备控制面板
function managertableEnterDevControlfun(rownumber){
    gCurOpenDevcode = $("#managerDevnumber" + rownumber).text();
    gCurOpenRownum = rownumber;
    getDevControlInfofun(gCurOpenDevcode);
}

//获取控制面板信息
function getDevControlInfofun(devcode){
        if(devcode == -1){
                return;
        }
        var data = {'companyname':companyname,'username':username,'devicecode':devcode};
        var temp = JSON.stringify(data);
        $.ajax({
        //url:('/dev/U/devcontrolinfo/'+ gCurOpenDevcode),
        url:('/dev/U/devcontrolinfo/'),
        type:'POST',
        data: {dat:temp},
        success:function(obj){
            //var obj = jQuery.parseJSON(argv);
            if(typeof(obj.devtype)=="undefined"){
                document.write(obj);
        　　    document.close();
                return;
            }
            var prjappPathname = obj.prjapppathname;
            gCurOpenDevtype = obj.devtype;
            gCurOpenDevShowtype = obj.devshowtype;
            loadXMLDoc(prjappPathname,"myModelBodyDivapp");
            document.getElementById("myModaltitleLabelapp").innerHTML='<h3 style="font-weight:bold;">'+obj.devname+'&nbsp;<span style="font-size:15px; font-weight:normal;" >控制面板</span></h3>';
            //$('#myModaltitleLabelapp').text(obj.devname + ' 的控制面板');
            //document.getElementById("myModelBodyDiv").innerHTML = '';
            //document.getElementById("myModalFooterapp").innerHTML = '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
            //document.getElementById("myModalFooterapp").innerHTML ="";
        },
        statusCode:{
            200:function(){
                console.log('devcontrolinfo:200');
            },
            302:function(){
                console.log('devcontrolinfo:302');
            },
            404:function(){
                console.log('devcontrolinfo:404');
            },
            500:function(){
                console.log('devcontrolinfo:500');
            }
        },
        complete:function(xmlhttprequest,textstatus){
            console.log('devcontrolinfo:complete');
        }
    });
}

//载入设备的内容
function loadXMLDoc(prjapppathname,mydiv){
    var xmlhttp;
    if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else{// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            console.log(xmlhttp.responseText);
            document.getElementById(mydiv).innerHTML=xmlhttp.responseText;
            if(!gOpenCtrlflag){
                gOpenCtrlflag = true;
                document.getElementById("buttonmodelapp").click();
            }
            appCommonInit(gCurOpenDevtype,gCurOpenDevShowtype);
        }
    }
    //xmlhttp.open("GET", "ajaxtest.txt?t=" + Math.random(), true);
    xmlhttp.open("GET", prjapppathname + '?t=' + Math.random(), true);
    xmlhttp.send();
}


//刷新人员表
function manageremployetablerefreshfun(obj){
    var z = 0;
    managerEmployename.splice(0,managerEmployename.length);
    managerEmployeRownumber.splice(0,managerEmployeRownumber.length);
    managertableclearfun("manageremployetable");
    managerEmployeTableTotalpage = obj.tabletotalpage;
    tablepagebtnfun(managerEmployeTableCurpage,managerEmployeTableTotalpage,"manageremployetable");
    for (var i = 0; i < obj.number.length; i++){
        managerEmployename.push(obj.employename[i]);
        managerEmployeRownumber.push(i);
        
        z = document.getElementById("manageremployetable").rows.length;
        var tableRow=document.getElementById("manageremployetable").insertRow(z);
        var Cell_0=tableRow.insertCell(0);
        Cell_0.innerHTML = obj.number[i];
        Cell_0.id = "managerEmployeRownumber" + i;
        var Cell_1= tableRow.insertCell(1); 
        Cell_1.innerHTML = obj.employename[i];
        Cell_1.id = "managerEmployename" + i;
        var Cell_2 = tableRow.insertCell(2);
        Cell_2.innerHTML = obj.employephonenum[i];
        Cell_2.id = "managerEmployePhonenum" + i;
        var Cell_3=tableRow.insertCell(3);
        Cell_3.innerHTML = obj.employeloginpw[i];
        Cell_3.id = "managerEmployeLoginpw" + i;
        var Cell_4=tableRow.insertCell(4);
        Cell_4.innerHTML = obj.employeoperatepw[i];
        Cell_4.id = "managerEmployeOperatepw" + i;

        var Cell_5=tableRow.insertCell(5);
        var lentmp=obj.employedevname[i].length;
        var employedevnametmp; 
        if(lentmp>1){
            employedevnametmp = '<select id="managerEmployeDevnameSelect' + i + '">';
            for (var j = 0; j < lentmp; j++) {
                employedevnametmp = employedevnametmp + '<option>' +  obj.employedevname[i][j] + '</option>';
            }; 
            employedevnametmp = employedevnametmp + '</select>';
            Cell_5.innerHTML = employedevnametmp;
        }else if(lentmp==1){
            Cell_5.innerHTML = obj.employedevname[i][0];
        }
        Cell_5.id = "managerEmployeDevname" + i;

        var Cell_6 = tableRow.insertCell(6);
        Cell_6.innerHTML = obj.employedaysucoperatesum[i];
        Cell_6.id = "managerEmployeDaySucOperatesum" + i;
        var Cell_7=tableRow.insertCell(7);
        Cell_7.innerHTML = obj.employedayfailoperatesum[i];
        Cell_7.id = "managerEmployeDayFailOperatesum" + i;

        var Cell_8= tableRow.insertCell(8);
        Cell_8.innerHTML = obj.employedayyield[i];
        Cell_8.id = "managerEmployeDayYield" + i;


        var Cell_9= tableRow.insertCell(9);
        Cell_9.innerHTML = obj.employedayoperateeff[i];
        Cell_9.id = "managerEmployeDayOperateeff" + i;
        var Cell_10 = tableRow.insertCell(10);
        Cell_10.innerHTML = obj.employemonthsucoperatesum[i];
        Cell_10.id = "managerEmployeMonthSucOperatesum" + i;
        var Cell_11=tableRow.insertCell(11);
        Cell_11.innerHTML = obj.employemonthfailoperatesum[i];
        Cell_11.id = "managerEmployeMonthFailOperatesum" + i;
        var Cell_12= tableRow.insertCell(12);
        Cell_12.innerHTML = obj.employemonthyield[i];
        Cell_12.id = "managerEmployeMonthYield" + i;

        var Cell_13=tableRow.insertCell(13);
        Cell_13.innerHTML = '<div class="visible-md visible-lg hidden-sm hidden-xs btn-group">'+
                                    '<button class="btn btn-xs btn-info miconbtn" id="managerEmployetableEditbtn' + i + '" title="编辑" onclick="editmanageremployetablefun(' + i + ');">'+
                                        '<span class="glyphicon glyphicon-edit "></span>'+
                                    '</button>'+
                                    '<button class="btn btn-xs btn-danger miconbtn" id="managerEmployetableDeletebtn' + i + '" title="删除" onclick="deletemanageremployetablefun(' + i + ');">'+
                                        '<span class="glyphicon glyphicon-trash"</span>'+
                                    '</button>'+
                                '</div>'+
                                '<div class="visible-xs visible-sm hidden-md hidden-lg">'+
                                    '<div class="btn-group dropdown">'+
                                        '<button class="btn btn-primary dropdown" data-toggle="dropdown">'+
                                            '<span class="glyphicon glyphicon-th-list"></span>'+
                                            '<span class="caret"></span>'+
                                        '</button>'+
                                        '<ul class="dropdown-menu dropdown-close">'+
                                            '<li id="managerEmployetableEditli' + i + '">'+
                                                '<button class="btn btn-xs btn-info miconbtn" title="编辑" onclick="editmanageremployetablefun(' + i + ');">'+
                                                    '<span class="glyphicon glyphicon-edit"></span>'+
                                                '</button>'+
                                            '</li>'+
                                            '<li id="managerEmployetableDeleteli' + i + '">'+
                                                '<button class="btn btn-xs btn-danger miconbtn" title="删除" onclick="deletemanageremployetablefun(' + i + ');">'+
                                                    '<span class="glyphicon glyphicon-trash"></span>'+
                                                '</button>'+
                                            '</li>'+
                                        '</ul>'+
                                    '</div>'+
                                '</div>';
        Cell_13.id = "managerEmployeTablebtn" + i;
    };
    managerEmployeTableobj = {"managerEmployename":managerEmployename, "managerEmployeRownumber":managerEmployeRownumber};
}

//删除人员表项
function deletemanageremployetablefun(rownumber){
    $('#myModaltitleLabel').text('删除人员表项');
    var user = $("#managerEmployename" + rownumber).text();
    document.getElementById("myModelBodyDiv").innerHTML = '您确定要删除人员表中人员名称为 ' + user + ' 的表项吗？';
    document.getElementById("myModalFooter").innerHTML = '<button type="button" class="btn btn-default" data-dismiss="modal" onclick="deletemanageremployetablefun2(' + rownumber + ');">确定</button> <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>';
    document.getElementById("buttonmodel").click();
}
function deletemanageremployetablefun2(rownumber){
    var user = $("#managerEmployename" + rownumber).text();
    var data = {'employname':user};
    var temp = JSON.stringify(data);
    console.log(temp,user);
    $.ajax({
        url: '/dev/U/delemploy/',
        type: 'POST',
        data:{dat:temp},
        success: function (argv) {
            tablerefreshfun(managerEmployeTableCurpage,managertablepagerows,"managerEmployetable");
        }
    });

    var validtmp = 0;
    for (var i = 0; i < managerEmployeTableobj.managerEmployeRownumber.length; i++){
        if(managerEmployeTableobj.managerEmployeRownumber[i]>=0){
            if(managerEmployeTableobj.managerEmployeRownumber[i] == rownumber){
                document.getElementById("manageremployetable").deleteRow(validtmp);
                managerEmployeTableobj.managerEmployeRownumber[i] = -1;
            }
            validtmp++;
        }
    };


    if(document.getElementById("manageremployetable").rows.length<1){
        tablerefreshfun(managerEmployeTableCurpage,managertablepagerows,"managerEmployetable");
    }
}


//添加人员表项
function addmanagerEmployetablefun(userdevname){
    $('#myModaltitleLabel').text("添加人员表项");
    var addemployerowtmp;
    addemployerowtmp = '<div class="row"><div class="col-md-9 col-md-offset-1"><form class="form-horizontal" role="form">'+
                        '<div class="form-group"><label class="col-sm-4 control-label">人员名称</label><div class="col-sm-8"><input type="text" id="addmanageremployenameipt" class="form-control"></div></div>'+
                        '<div class="form-group"><label class="col-sm-4 control-label">手机号码</label><div class="col-sm-8"><input type="text" id="addmanageremployephinenumipt" class="form-control"></div></div>'+
                        '<div class="form-group"><label class="col-sm-4 control-label">登录密码</label><div class="col-sm-8"><input type="text" id="addmanageremployeloginpwipt" class="form-control"></div></div>'+
                        '<div class="form-group"><label class="col-sm-4 control-label">操作密码</label><div class="col-sm-8"><input type="text" id="addmanageremployeoperatepwipt" class="form-control"></div></div>'+
                        '<div class="form-group"><label class="col-sm-4 control-label">设备名称</label><div class="col-sm-8"><select id="addmanageremployedevnameslt" class="form-control" multiple="multiple" size="5" >';
    for(var i = 0; i < userdevname.length; i++) {
        addemployerowtmp = addemployerowtmp + '<option>'+ userdevname[i] + '</option>';
    }
    addemployerowtmp = addemployerowtmp +  '</select></div></div>'+'</form></div> </div>';
    document.getElementById("myModelBodyDiv").innerHTML = addemployerowtmp;
    document.getElementById("myModalFooter").innerHTML = '<button type="button" class="btn btn-default" onclick="Okaddmanageremployetablefun();">添加</button> <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
    document.getElementById("buttonmodel").click();
}

//确认添加人员表项
function Okaddmanageremployetablefun(){
    var tabletype = "managerEmployetable";
    var managerEmployetableItemtitle = new Array();
    managerEmployetableItemtitle[0] = "人员名称";
    managerEmployetableItemtitle[1] = "手机号码";
    managerEmployetableItemtitle[2] = "登录密码";
    managerEmployetableItemtitle[3] = "操作密码";
    managerEmployetableItemtitle[4] = "设备名称";
    var managerEmployetableItemtext = new Array(); 
    var managerEmployetableItemtext2 = new Array(); 
    managerEmployetableItemtext2[0] = $("#addmanageremployenameipt").val();
    managerEmployetableItemtext[0] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];
    managerEmployetableItemtext2[0] = $("#addmanageremployephinenumipt").val();
    managerEmployetableItemtext[1] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];
    managerEmployetableItemtext2[0] = $("#addmanageremployeloginpwipt").val();
    managerEmployetableItemtext[2] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];
    managerEmployetableItemtext2[0] = $("#addmanageremployeoperatepwipt").val();
    managerEmployetableItemtext[3] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];
    var tmp = document.getElementById("addmanageremployedevnameslt");
    for (var i = 0; i < tmp.length; i++) {
        if(tmp[i].selected == true){
            var tmp1 = tmp[i].text;
            managerEmployetableItemtext2.push(tmp1);
        }
    };
    managerEmployetableItemtext[4] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];
    var data = {'companyname':companyname,'username':username,'tabletype':tabletype,'tableItemtitle':managerEmployetableItemtitle,'tableItemtext':managerEmployetableItemtext};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/dev/U/add/',
        type: 'POST',
        data:{dat:temp},
        success: function (argv) {
            //判断是否添加成功,如果用户名重复则添加不成功
            console.log(argv)
            tablerefreshfun(managerEmployeTableCurpage,managertablepagerows,"managerEmployetable");
        }
    });
}

//编辑人员表项
function editmanageremployetablefun(rownumber){
    var user = $("#managerEmployename" + rownumber).text();
    $('#myModaltitleLabel').text(user + ' 的表项编辑');
    var editemployerowtmp;
    editemployerowtmp = '<div class="row"><div class="col-md-9 col-md-offset-1"><form class="form-horizontal" role="form">'+
                        '<div class="form-group"><label class="col-sm-4 control-label">人员名称</label><div class="col-sm-8"><input type="text" id="editmanageremployenameipt" class="form-control" value="' + $("#managerEmployename" + rownumber).text() + '"></div></div>'+
                        '<div class="form-group"><label class="col-sm-4 control-label">手机号码</label><div class="col-sm-8"><input type="text" id="editmanageremployephinenumipt" class="form-control" value="' + $("#managerEmployePhonenum" + rownumber).text() + '"></div></div>'+
                        '<div class="form-group"><label class="col-sm-4 control-label">登录密码</label><div class="col-sm-8"><input type="text" id="editmanageremployeloginpwipt" class="form-control" value="' + $("#managerEmployeLoginpw" + rownumber).text() + '"></div></div>'+
                        '<div class="form-group"><label class="col-sm-4 control-label">操作密码</label><div class="col-sm-8"><input type="text" id="editmanageremployeoperatepwipt" class="form-control" value="' + $("#managerEmployeOperatepw" + rownumber).text() + '"></div></div>'+
                        '<div class="form-group"><label class="col-sm-4 control-label">设备名称</label><div class="col-sm-8"><select id="editmanageremployedevnameslt" class="form-control" multiple="multiple" size="5" >';
    var  selecttmp = document.getElementById("managerEmployeDevnameSelect" + rownumber);
    console.log(selecttmp,rownumber,userDevname)
    var a 
    if(selecttmp == null){
        a = $("#managerEmployeDevname"+rownumber).html()
        console.log(a)
        editemployerowtmp = editemployerowtmp + '<option style="color:red;" selected="selected">'+ a + '</option>';
        for(var i=0;i<userDevname.length;i++){
            if(userDevname[i]!=a){
                editemployerowtmp = editemployerowtmp + '<option>'+ userDevname[i] + '</option>';
            }
        }
    }else{
        for (var i = 0; i < selecttmp.length; i++) {
                editemployerowtmp = editemployerowtmp + '<option style="color:red;" selected="selected">'+ selecttmp[i].text + '</option>';
        };
        

        for(var i = 0; i < userDevname.length; i++) {
            for (var j = 0; j < selecttmp.length; j++) {
                    if(selecttmp[j].text == userDevname[i]){
                        break;
                    }
            };

            if(j == selecttmp.length){
                editemployerowtmp = editemployerowtmp + '<option>'+ userDevname[i] + '</option>';
            }
        }
    }
    editemployerowtmp = editemployerowtmp +  '</select></div></div>'+
    '<div class="form-group"><label class="col-sm-4 control-label">日成品数(个)</label><div class="col-sm-8"><input type="text" id="editmanageremployedaysucoperatesumipt" class="form-control" value="' + $("#managerEmployeDaySucOperatesum" + rownumber).text() + '"></div></div>'+
    '<div class="form-group"><label class="col-sm-4 control-label">日废品数(个)</label><div class="col-sm-8"><input type="text" id="editmanageremployedayfailoperatesumipt" class="form-control" value="' + $("#managerEmployeDayFailOperatesum" + rownumber).text() + '"></div></div>'+
    '<div class="form-group"><label class="col-sm-4 control-label">月成品数(个)</label><div class="col-sm-8"><input type="text" id="editmanageremployemonthsucoperatesumipt" class="form-control" value="' + $("#managerEmployeMonthSucOperatesum" + rownumber).text() + '"></div></div>'+
    '<div class="form-group"><label class="col-sm-4 control-label">月废品数(个)</label><div class="col-sm-8"><input type="text" id="editmanageremployemonthfailoperatesumipt" class="form-control" value="' + $("#managerEmployeMonthFailOperatesum" + rownumber).text() + '"></div></div>'+
    '</form></div> </div>';
    document.getElementById("myModelBodyDiv").innerHTML = editemployerowtmp;
    document.getElementById("myModalFooter").innerHTML = '<button type="button" class="btn btn-default" onclick="Okeditmanageremployetablefun(' + rownumber + ');">提交</button> <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
    document.getElementById("buttonmodel").click();
}

//确认编辑人员表项
function Okeditmanageremployetablefun(rownumber){
    var tabletype = "managerEmployetable";
    var managerEmployetableItemtitle = new Array();
    managerEmployetableItemtitle[0] = "人员名称";
    managerEmployetableItemtitle[1] = "手机号码";
    managerEmployetableItemtitle[2] = "登录密码";
    managerEmployetableItemtitle[3] = "操作密码";
    managerEmployetableItemtitle[4] = "设备名称";
    managerEmployetableItemtitle[5] = "日成品数(个)";
    managerEmployetableItemtitle[6] = "日废品数(个)";
    managerEmployetableItemtitle[7] = "月成品数(个)";
    managerEmployetableItemtitle[8] = "月废品数(个)";
    var managerEmployetableItemtext = new Array(); 
    var managerEmployetableItemtext2 = new Array(); 
    managerEmployetableItemtext2[0] = $("#editmanageremployenameipt").val();
    managerEmployetableItemtext[0] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];
    managerEmployetableItemtext2[0] = $("#editmanageremployephinenumipt").val();
    managerEmployetableItemtext[1] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];
    managerEmployetableItemtext2[0] = $("#editmanageremployeloginpwipt").val();
    managerEmployetableItemtext[2] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];
    managerEmployetableItemtext2[0] = $("#editmanageremployeoperatepwipt").val();
    managerEmployetableItemtext[3] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];
    var tmp = document.getElementById("editmanageremployedevnameslt");
    for (var i = 0; i < tmp.length; i++) {
        if(tmp[i].selected == true){
            var tmp1 = tmp[i].text;
            managerEmployetableItemtext2.push(tmp1);
        }
    };
    managerEmployetableItemtext[4] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];

    managerEmployetableItemtext2[0] = $("#editmanageremployedaysucoperatesumipt").val();
    managerEmployetableItemtext[5] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];
    managerEmployetableItemtext2[0] = $("#editmanageremployedayfailoperatesumipt").val();
    managerEmployetableItemtext[6] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];
    managerEmployetableItemtext2[0] = $("#editmanageremployemonthsucoperatesumipt").val();
    managerEmployetableItemtext[7] = managerEmployetableItemtext2;
    managerEmployevtableItemtext2 = [];
    managerEmployetableItemtext2[0] = $("#editmanageremployemonthfailoperatesumipt").val();
    managerEmployetableItemtext[8] = managerEmployetableItemtext2;
    managerEmployetableItemtext2 = [];
    var data = {'companyname':companyname,'username':username,'tabletype':tabletype,'tableItemtitle':managerEmployetableItemtitle,'tableItemtext':managerEmployetableItemtext};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/dev/U/editdevname/',
        type: 'POST',
        data:{dat:temp},
        success: function (argv) {
            //20161027刷新设备管理表
            tablerefreshfun(managerDevTableCurpage,managertablepagerows,"managerDevtable");

            document.getElementById("managerEmployename" + rownumber).innerHTML = managerEmployetableItemtext[0][0];
            document.getElementById("managerEmployePhonenum" + rownumber).innerHTML = managerEmployetableItemtext[1][0];
            document.getElementById("managerEmployeLoginpw" + rownumber).innerHTML = managerEmployetableItemtext[2][0];
            document.getElementById("managerEmployeOperatepw" + rownumber).innerHTML = managerEmployetableItemtext[3][0];
            var lentmp=managerEmployetableItemtext[4].length;
            console.log(managerEmployetableItemtext)
            var employedevnametmp; 
            if(lentmp>1){
                employedevnametmp = '<select id="managerEmployeDevnameSelect' + rownumber + '">';
                for (var j = 0; j < lentmp; j++) {
                    employedevnametmp = employedevnametmp + '<option>' +  managerEmployetableItemtext[4][j] + '</option>';
                }; 
                employedevnametmp = employedevnametmp + '</select>';
                document.getElementById("managerEmployeDevname" + rownumber).innerHTML = employedevnametmp;
            }else if(lentmp==1){
                document.getElementById("managerEmployeDevname" + rownumber).innerHTML = managerEmployetableItemtext[4][0];
            }
            document.getElementById("managerEmployeDaySucOperatesum" + rownumber).innerHTML = managerEmployetableItemtext[5][0];
            document.getElementById("managerEmployeDayFailOperatesum" + rownumber).innerHTML = managerEmployetableItemtext[6][0];
            document.getElementById("managerEmployeMonthSucOperatesum" + rownumber).innerHTML = managerEmployetableItemtext[7][0];
            document.getElementById("managerEmployeMonthFailOperatesum" + rownumber).innerHTML = managerEmployetableItemtext[8][0];
        }
    });
}

var userDevname;
//获取人员名下的设备名称
function  getUserDevNamefun(rownumber,type){
    var user;
    if(rownumber == "username"){
        user = username;
    }else if(rownumber >= 0){
        user = $("#managerDevname" + rownumber).text();
    }
    var data = {'companyname':companyname,'username':user};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/dev/U/getuserdevname/',
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        data:{dat:temp},
        success: function (argv) {
            //var obj = jQuery.parseJSON(argv);
            //var userdevname = obj.devname;
            var userdevname = argv.devname;
            console.log(userdevname)
            if(type == "addmanagerEmployetable"){
                //userDevname = obj.devname;
                userDevname = argv.devname;
                addmanagerEmployetablefun(userdevname);
            }else if(type == "init"){
                //userDevname = obj.devname;
                userDevname = argv.devname;
            }
        }
    });
}

var gOpenCtrlflag = false;
function ExitDevControlfun(){
    gCurOpenDevcode = -1;
    gCurOpenDevtype = -1;
    gGetCalDataflag = false;
    gOpenCtrlflag = false;
}

var gExeRunValue = 80;
var gUserExeValue = 60;
var gGetCalDataflag = false;
//执行过程的路径位置点
function DevProcessExePathtpfun(obj){
    var i;
    var pathlength;
    for (var i = 0; i < gDeviceCode.length; i++) {
        if(gDeviceCode[i]==obj.Devid){
            obj.Data=JSON.parse(obj.Data.curProcessDsc);
            gDevProcessDsc[i] = obj.Data.index-1;
            if(obj.Data.index <= 0){
                return;
            }
            pathlength = obj.Data.length;
            if(gDevRunProgressCode [i]== gExeRunValue && obj.Data.index>0 && pathlength>0){
                var pradistmp =parseInt((obj.Data.index)*parseInt(100-gExeRunValue)/pathlength) + parseInt(gDevRunProgressCode [i]);
                var distmp = pradistmp+'%: '+ gDevRunProgressdis[i];
                $("#DevRunprogressTxt"+i).text(distmp);
                document.getElementById("DevRunprogressPar"+i).style.width=pradistmp+'%';
            }
            break;
        }
    }
    if(gCurOpenDevcode == obj.Devid){//进度不同动态过程的状不同
        if(gDevRunProgressCode[gCurOpenRownum] == gExeRunValue && obj.Data.index>0 && pathlength>=gDevProcessDsc[gCurOpenRownum]){
             if(gCurOpenDevtype == gAppCanvasDevtype){
                //画动态图
                //redrawline();
                DrawLineCurPath(gDevProcessDsc[gCurOpenRownum],true);
            }else if(gCurOpenDevtype == gAppScrewDevtype){
                //画动态图
                //redrawconnector();
                DrawConnectorCurPath(gDevProcessDsc[gCurOpenRownum],true);
            }
        }
    }
}

//设备的实时运行状态
function DevStatustpfun(obj){
    var i;
    for (i = 0; i < gDeviceCode.length; i++) {
        if(gDeviceCode[i]==obj.Devid){
            gDevRunstateCode[i] = obj.Data.devicerunstatecode;
            /*if(gDevListShowView=="grid"){
                if(obj.Data.devicerunstatecode>20000){
                    $("#gridtitle"+i).addClass('unnormal');
                    $("#DevRunstate"+i).val(obj.Data.devicerunstatecode+' code:'+obj.Data.devicerunstate);
                }else{
                    $("#DevRunstate"+i).val(obj.Data.devicerunstatecode);
                    $("#gridtitle"+i).addClass('normal');
                }
            }else if(gDevListShowView=="table"){*/
                if(obj.Data.devicerunstatecode>20000){
                    document.getElementById("managerDevRunstate"+i).innerHTML=obj.Data.devicerunstatecode+' code:'+obj.Data.devicerunstate;
                }else{
                    document.getElementById("managerDevRunstate"+i).innerHTML=obj.Data.devicerunstatecode;
                }
            //}
            break;
        }
    }
}

//设备的实时运行进度
function DevProcesstpfun(obj){
    var i;
    for (i = 0; i < gDeviceCode.length; i++) {
        if(gDeviceCode[i]==obj.Devid){
            gDevRunProgressCode[i] = obj.Data.devicerunprogresscode;
            gDevRunProgressdis[i] = obj.Data.devicerunprogress;
            var distmp = obj.Data.devicerunprogresscode+'%: '+obj.Data.devicerunprogress;
            $("#DevRunprogressTxt"+i).text(distmp);
            document.getElementById("DevRunprogressPar"+i).style.width=obj.Data.devicerunprogresscode+'%';
            //$("#DevRunprogressPar"+i).css({width:obj.Data.devicerunprogresscode+'%'});
            break;
        }
    }
    if(gCurOpenDevcode == obj.Devid){//进度不同所状态不同
        DevCurExeInfo(gCurOpenDevShowtype);
    }
}

//识别图片的实时地址
function CurrentPicAddrtpfun(obj){
    if(gCurOpenDevcode == obj.Devid){
        gCurPicturepath = obj.Data.CurrentPicAddr;
        load(gCurPicturepath);
    }
}

//设备操作者改变处理
function DevOpertorChangetpfun(obj){
    for(var i = 0; i < gDeviceCode.length; i++){
        if(gDeviceCode[i]==obj.Devid){
            if(obj.Data.newusername != $("#managerDevCurOperator" + i).text()){
                document.getElementById("managerDevCurOperator"+i).innerHTML=obj.Data.newusername;
            }
        }
    }
    if(gCurOpenDevcode == obj.Devid){
        if(obj.Data.companyname == companyname){
            getDevControlInfofun(gCurOpenDevcode);
            if(obj.Data.oldusername == username && obj.Data.newusername != username){
                $('#myModaltitleLabel').text('设备控制权限');
                document.getElementById("myModelBodyDiv").innerHTML='设备控制权限已被'+obj.Data.newusername+'获取！请您注意设备的使用安全！';
                document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" data-dismiss="modal" onclick="clearmodelcssfun();">关闭</button>';
                document.getElementById("buttonmodel").click();
                $('#myModelBodyDiv').addClass("fail");
            }
        }
    }
}

//设备执行完成一次流程的操作
function DevProcessfintpfun(obj){
    var i;
    for (i = 0; i < gDeviceCode.length; i++) {
        if(gDeviceCode[i]==obj.Devid){
            /*if(gDevListShowView=="grid"){
                $("#DevDaySucOperatesum"+i).val(obj.Data.devicedaysucoperatesum);
                $("#DevDayFailOperatesum"+i).text(obj.Data.devicedayfailoperatesum);
            }else if(gDevListShowView=="table"){*/
                document.getElementById("managerDevDaySucOperatesum"+i).innerHTML=obj.Data.devicedaysucoperatesum;
                document.getElementById("managerDevDayFailOperatesum"+i).innerHTML=obj.Data.devicedayfailoperatesum;
            //}
        }
    }
}

//累计的工作时间
function DevDayWorktimetpfun(obj){
    var i;
    for (i = 0; i < gDeviceCode.length; i++) {
        if(gDeviceCode[i]==obj.Devid){
            /*if(gDevListShowView=="grid"){
                $("#DevDayWorktime"+i).val(obj.Data.devicedayworktime);
            }else if(gDevListShowView=="table"){*/
                document.getElementById("managerDevDayWorktime"+i).innerHTML=obj.Data.devicedayworktime;
            //}
        }
    }
}

var wsocket;
function WebSocketInit(){
    wsocket = new WebSocket("ws://192.168.1.114:8080/dev/U/echo/");
    wsocket.onopen = function () {
        var date = new Date();
        var curdate = date.toLocaleString();
        console.log(curdate + 'WebSocket open');
    };
    wsocket.onmessage = function (e) {
        var date = new Date();
        var curdate = date.toLocaleString();
        console.log(curdate + 'message: ' + e.data);
        var obj = JSON.parse(e.data);
        switch(obj.WSSType){
            case 'devprocessexepathtp'://运行时执行中的过程数据
            DevProcessExePathtpfun(obj);
            break;
            case 'devstatustp'://运行状态：致命错误，异常，警告
            DevStatustpfun(obj);
            break;
            case 'devprocesstp'://运行进度
            DevProcesstpfun(obj);
            break;
            case 'currentpicaddrtp'://当前图片地址
            CurrentPicAddrtpfun(obj);
            break;
            //case 'caldatatp'://计算结果
            //CalDatatpfun(obj);
            //break;
            case 'devoperatorchangetp'://操作权限被改变
            DevOpertorChangetpfun(obj);
            break;
            case 'devprocessfintp'://运行完成一个
            DevProcessfintpfun(obj);
            break;
            case 'devdayworktimetp'://设备工作时间达到一小时推送
            DevDayWorktimetpfun(obj);
            break;
            default:
            break;
        }
    };
    wsocket.onclose = function()
    { 
        // 关闭 websocket
        var date = new Date();
        var curdate = date.toLocaleString();
        console.log(curdate + "WebSocket连接已关闭..."); 
        WebSocketInit();
    };
    wsocket.onerror = function()
    {
        var date = new Date();
        var curdate = date.toLocaleString();
        console.log(curdate + "WebSocket连接出现错误..."); 
        WebSocketInit();
    }
}

function MonitorWebSocket(){
    if(!wsocket || wsocket.readyState != 1){
        WebSocketInit();
    }
}
//与服务器之间的通讯
$(function(){
    if ("WebSocket" in window)
    {
        if(wsocket){
            wsocket.close();
        }
        WebSocketInit();
        //setTimeout(MonitorWebSocket(),1000);
    }else{
        alert("您的浏览器不支持 WebSocket!");
    }
});





