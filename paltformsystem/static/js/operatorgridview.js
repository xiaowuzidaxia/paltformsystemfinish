var companyname;
var username;
jQuery(document).ready(function () {
    $.ajax({
        url: '/webmc/getloginuserinfo/',//用户公司名称，用户名
        type: 'GET',
        success: function (argv) {
            console.log(argv);
            var obj = jQuery.parseJSON(argv);
            console.log(obj);
            companyname = obj.companyname;
            username = obj.username;
            $('#username').html(username);
        }
    });
    devlistfun("grid");
});

//获取设备控制权限
function devgetoperaterightfun(num){
    $('#myModaltitleLabel').text('获取设备操作权限');
    document.getElementById("myModelBodyDiv").innerHTML = '<div class="row"><div class="col-md-9 col-md-offset-1"><form class="form-horizontal" role="form">'+
                          '<div class="errorcode text-center"><span id="getoperatepwerrordiscb"></span></div><br />'+
                          '<div class="form-group" id="getoperatepwcss"><label class="col-sm-4 control-label">操作密码</label><div class="col-sm-8"><input class="form-control" id="getoperatepw" type="password"></div></div>'+
                          '</form></div> </div>';
    document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" onclick="postdevgetoperaterightfun('+num+');">提交</button> <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
    document.getElementById("buttonmodel").click();
}

//提交设备控制权操作密码
function postdevgetoperaterightfun(num){
    var operatepassword = $('#getoperatepw').val();
    $('#getoperatepw').keyup(function () {
        $('#getoperatepwcss').removeClass("has-warning");
        $('#getoperatepwerrordiscb').text("");
    });
    if (operatepassword == '') {
        $('#getoperatepwcss').addClass("has-warning");
        $('#getoperatepw').focus();
        return false;
    }
    var data = {'companyname':companyname,'username':username,'operatepassword':operatepassword,'typenum':num};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/webmc/operateright/',
        type: 'POST',
        data:{dat:temp},
        success: function (argv) {
            var obj = jQuery.parseJSON(argv);
            $('#getoperatepwerrordiscb').text(obj.discb);
            if(obj.discbcss=="suc"){
                $('#getoperatepwerrordiscb').removeClass("fail");
                $('#getoperatepwerrordiscb').addClass("suc");
            }else if(obj.discbcss=="fail"){
                $('#getoperatepwerrordiscb').removeClass("suc");
                $('#getoperatepwerrordiscb').addClass("fail");
            }
        }
    });
}

var gDeviceCode = new Array();
//获取设备信息
function devlistfun(type){  
    var txttmp='';
    var data = {'companyname':companyname,'username':username,'type':type};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/webmc/operatorgetdevinfo/',
        type: 'POST',
        dataType: 'json',
        data: {dat:temp},
    })
    .done(function(obj) {
        console.log(obj);
        for (var i = 0; i < obj.devicecode.length; i++) {
            gDeviceCode.push(obj.devicecode[i]);
            txttmp = txttmp + '<div class="col-sm-6 col-md-4"><a class="thumbnail girda">'+
            '<div class="gridtitle" id="gridtitle'+i+'" onclick="EnterDevControlfun('+i+')"><img src="'+obj.imgpath[i]+'" class="gridimg"><h3 id="devicename'+i+'">'+obj.devicename[i]+'</h3>'+
            '<br /></div><form class="form-horizontal" role="form"><br />'+
            '<div class="form-group"><label class="col-sm-4 control-label">生命状态</label><div class="col-sm-8"><span class="form-control" id="devicelifestatecode'+i+'">'+obj.devicelifestatecode[i]+'</span></div></div>'+
            '<div class="form-group"><label class="col-sm-4 control-label">运行状态</label><div class="col-sm-8"><input class="form-control" type="text" readonly="readonly" id="devicerunstatecode'+i+'" value="'+obj.devicerunstatecode[i]+'"></div></div>'+
            '<div class="form-group"><label class="col-sm-4 control-label">运行进度</label><div class="col-sm-8"><div class="form-control"> </div id="devicerunprogresscode'+i+'"></div></div>'+
            '<div class="form-group"><label class="col-sm-4 control-label">日工作时长(时)</label><div class="col-sm-8"><input class="form-control" type="text" readonly="readonly" id="devicedayworktime'+i+'" value="'+obj.devicedayworktime[i]+'"></div></div>'+
            '<div class="form-group"><label class="col-sm-4 control-label">日成品数(个)</label><div class="col-sm-8"><span class="form-control" id="devicedaysucoperatesum'+i+'">'+obj.devicedaysucoperatesum[i]+'</span></div></div>'+
            '<div class="form-group"><label class="col-sm-4 control-label">日废品数(个)</label><div class="col-sm-8"><input class="form-control" type="text" readonly="readonly" id="devicedayfailoperatesum'+i+'" value="'+obj.devicedayfailoperatesum[i]+'"></div></div>'+
            '<div class="form-group"><div class="col-sm-6"><input type="button" value="获取该设备操作权限" class="btn btn-info btn-block" title="获取该设备操作权限" onclick="devgetoperaterightfun('+i+')" /> </div>'+
            '<div class="col-sm-6"><input type="button" value="查看设备其他信息" class="btn btn-info btn-block" title="查看设备其他信息" onclick="devotherinfofun('+i+')" /> </div></div>'+
            '</form></a></div>';
        };
        document.getElementById("devgridview").innerHTML = txttmp;
        for (var i = 0; i < obj.devicerunstatecode.length; i++) {
            if(obj.devicerunstatecode[i]>2){
                $("#gridtitle"+i).addClass('unnormal');
            }else{
                $("#gridtitle"+i).addClass('normal');
            }
        };
    })
    .fail(function() {
        console.log("error");
    })
    .always(function() {
        console.log("complete");
    });   
}

//获取设备其他信息
function devotherinfofun(num){
    var Devnametmp = $("#devicename" + num).text();
    var Devnumbertmp = gDeviceCode[num];
    $.ajax({
        url:('/webmc/devinfo/'+ Devnumbertmp),
        type:'GET',
        success:function(argv){
            var obj = jQuery.parseJSON(argv);
            console.log(obj);
            $('#myModaltitleLabel').text(Devnametmp + ' 设备的其他信息');
            document.getElementById("myModelBodyDiv").innerHTML = '<div class="row"><div class="col-md-9 col-md-offset-1"><form class="form-horizontal" role="form">'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">设备序列号</label><div class="col-sm-8"><span class="form-control">' + Devnumbertmp + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">设备类型</label><div class="col-sm-8"><span class="form-control">' + obj.devtype + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">出厂日期</label><div class="col-sm-8"><span class="form-control">' + obj.devdeliverydate + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">有效期</label><div class="col-sm-8"><span class="form-control">' + obj.devexpirydate + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">累计工作时长(时)</label><div class="col-sm-8"><span class="form-control">' + obj.devetotalworktime + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">月成品数(个)</label><div class="col-sm-8"><span class="form-control">' + obj.devmonthsucoperatesum + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">月废品数(个)</label><div class="col-sm-8"><span class="form-control">' + obj.devmonthfailoperatesum + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">累计成品数(个)</label><div class="col-sm-8"><span class="form-control">' + obj.devtotalsucoperatesum + '</span></div></div>'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">累计废品数(个)</label><div class="col-sm-8"><span class="form-control">' + obj.devtotalfailoperatesum + '</span></div></div>'+
                                                                  '</form></div> </div>';
            document.getElementById("myModalFooter").innerHTML = '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
            document.getElementById("buttonmodel").click();
        }
    });
}


//进入设备控制面板
function EnterDevControlfun(num){
    var Devnumbertmp = gDeviceCode[num];
    $.ajax({
        url:('/webmc/devcontrolinfo/'+ Devnumbertmp),
        type:'GET',
        success:function(argv){
            var obj = jQuery.parseJSON(argv);
            console.log(obj);
            var prjappPathname=obj.prjapppathname;
            loadXMLDoc(prjappPathname,"myModelBodyDiv");
            $('#myModaltitleLabel').text(obj.devname + ' 的控制面板');
            //document.getElementById("myModelBodyDiv").innerHTML = '';
            document.getElementById("myModalFooter").innerHTML = '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
            document.getElementById("buttonmodel").click();
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
        }
    }
    //xmlhttp.open("GET", "ajaxtest.txt?t=" + Math.random(), true);
    xmlhttp.open("GET", prjapppathname + '?t=' + Math.random(), true);
    xmlhttp.send();
}
