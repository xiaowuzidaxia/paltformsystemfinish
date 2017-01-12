var companyname;
var username;
jQuery(document).ready(function () {
    $.ajax({
        url: '/dev/U/getloginuserinfo/',//用户公司名称，用户名
        type: 'GET',
        success: function (obj) {
            //console.log(argv);
            //var obj = jQuery.parseJSON(argv);
            console.log(obj);
            companyname = obj.companyname;
            username = obj.username;
            $('#username').html(username);
        }
    });
    devlistfun("grid");
    //devlistfun("table");
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
    num = gDeviceCode[num];
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
    //var data = {'companyname':companyname,'username':username,'type':type};
    var data = {'companyname':"hangzhou",'username':"xiao",'type':type};
    var temp = JSON.stringify(data);
    console.log(temp);
    $.ajax({
        url: '/dev/U/operatorgetdevinfo/',
        type: 'POST',
        dataType: 'json',
        data: {dat:temp},
        success: function (obj) {
            //var obj = jQuery.parseJSON(argv);
            console.log(obj);
            if(type=="grid"){
                devgridlviewfun(obj);
            }else if(type=="table"){
                devtableviewfun(obj);
            }
        }
    });
    /*.done(function(obj){
        console.log(obj);
        if(type=="grid"){
            devgridlviewfun(obj);
        }else if(type=="table"){
            devtableviewfun(obj);
        }
    })
    .fail(function() {
        console.log("error");
    })
    .always(function() {
        console.log("complete");
    });*/   
}

//宫格显示
function devgridlviewfun(obj){
    var txttmp='';
    for (var i = 0; i < obj.devicecode.length; i++) {
        gDeviceCode.push(obj.devicecode[i]);
        txttmp = txttmp + '<div class="col-sm-6 col-md-4"><a class="thumbnail girda">'+
        '<div class="gridtitle" id="gridtitle'+i+'" onclick="EnterDevControlfun('+i+')"><img src="'+obj.imgpath[i]+'" class="gridimg"><h3 id="Devname'+i+'">'+obj.devicename[i]+'</h3>'+
        '<br /></div><form class="form-horizontal" role="form"><br />'+
        '<div class="form-group"><label class="col-sm-4 control-label">生命状态</label><div class="col-sm-8"><span class="form-control" id="Devlifestate'+i+'">'+obj.devicelifestatecode[i]+'</span></div></div>'+
        '<div class="form-group"><label class="col-sm-4 control-label">运行状态</label><div class="col-sm-8"><input class="form-control" type="text" readonly="readonly" id="DevRunstate'+i+'" value="'+obj.devicerunstatecode[i]+'"></div></div>'+
        '<div class="form-group"><label class="col-sm-4 control-label">运行进度</label><div class="col-sm-8"><span class="form-control" id="DevRunprogress'+i+'"> '+obj.devicerunprogresscode[i]+'</span></div></div>'+
        '<div class="form-group"><label class="col-sm-4 control-label">日成品数(个)</label><div class="col-sm-8"><input class="form-control" type="text" readonly="readonly" id="DevDayFailOperatesum'+i+'" value="'+obj.devicedaysucoperatesum[i]+'"></div></div>'+
        '<div class="form-group"><label class="col-sm-4 control-label">日废品数(个)</label><div class="col-sm-8"><span class="form-control" id="DevDaySucOperatesum'+i+'">'+obj.devicedayfailoperatesum[i]+'</span></div></div>'+
        '<div class="form-group"><label class="col-sm-4 control-label">日工作时长(时)</label><div class="col-sm-8"><input class="form-control" type="text" readonly="readonly" id="DevDayWorktime'+i+'" value="'+obj.devicedayworktime[i]+'"></div></div>'+
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
    $("#gridviewli").addClass('active');
    $("#tableviewli").removeClass('active');
}

//列表显示
function devtableviewfun(obj){
    var txttmp='';
    txttmp = '<div class="table-responsive"><table class="table table-striped table-bordered table-hover"><caption>设备表</caption>'+
        '<thead><tr><th>序号</th><th>设备图标</th><th>设备名称</th><th>生命状态</th><th>运行状态</th><th>运行进度</th><th>日成品数(个)</th><th>日废品数(个)</th><th>日工作时长(时)</th><th>操作</th></tr>'+
        '</thead><tbody id="devtableview"></tbody></table><br /><br /><br /><br /></div>';
    document.getElementById("devgridview").innerHTML = txttmp;    
    var z = 0;
    /*var rowlen = document.getElementById("devtableview").rows.length;
    for (var i = 0; i < rowlen; i++) {
        document.getElementById(table).deleteRow(0);
    };*/
    for (var i = 0; i < obj.devicecode.length; i++) {
        gDeviceCode.push(obj.devicecode[i]);
        z = document.getElementById("devtableview").rows.length;
        var tableRow=document.getElementById("devtableview").insertRow(z);
        var Cell_0=tableRow.insertCell(0);
        Cell_0.innerHTML = obj.number[i];
        Cell_0.id = "DevRownumber" + i;
        var Cell_1= tableRow.insertCell(1);
        Cell_1.innerHTML = '<img src="'+obj.imgpath[i]+'" class="tableimg">';
        Cell_1.id = "Devimg" + i;
        var Cell_2 = tableRow.insertCell(2);
        Cell_2.innerHTML = obj.devicename[i];
        Cell_2.id = "Devname" + i;
        var Cell_3=tableRow.insertCell(3);
        Cell_3.innerHTML = obj.devicelifestatecode[i];
        Cell_3.id = "Devlifestate" + i;
        var Cell_4=tableRow.insertCell(4);
        Cell_4.innerHTML = obj.devicerunstatecode[i];
        Cell_4.id = "DevRunstate" + i;

        var Cell_5=tableRow.insertCell(5);
        Cell_5.innerHTML = obj.devicerunprogresscode[i];
        Cell_5.id = "DevRunprogress" + i;
        var Cell_6 = tableRow.insertCell(6);
        Cell_6.innerHTML = obj.devicedaysucoperatesum[i];
        Cell_6.id = "DevDaySucOperatesum" + i;
        var Cell_7=tableRow.insertCell(7);
        Cell_7.innerHTML = obj.devicedayfailoperatesum[i];
        Cell_7.id = "DevDayFailOperatesum" + i;

        var Cell_8= tableRow.insertCell(8);
        Cell_8.innerHTML = obj.devicedayworktime[i];
        Cell_8.id = "DevDayWorktime" + i;

        var Cell_9=tableRow.insertCell(9);
        Cell_9.innerHTML = '<div class="visible-md visible-lg hidden-sm hidden-xs btn-group">'+
                                    '<button class="btn btn-xs btn-info miconbtn" id="tableEditbtn' + i + '" title="获取该设备操作权限" onclick="devgetoperaterightfun(' + i + ');">'+
                                        '<span class="glyphicon glyphicon-hand-up"></span><span class="glyphicon  glyphicon-transfer"></span>'+
                                    '</button>'+
                                    '<button class="btn btn-xs btn-success miconbtn" id="tableViewDevInfobtn' + i + '" title="查看设备其他信息" onclick="devotherinfofun(' + i + ');">'+
                                        '<span class="glyphicon glyphicon-zoom-in"</span>'+
                                    '</button>'+
                                    '<button class="btn btn-xs btn-primary miconbtn" id="tableEnterDevControlbtn' + i + '" title="进入控制面板" onclick="EnterDevControlfun(' + i + ');">'+
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
                                            '<li id="tableEditli' + i + '">'+
                                                '<button class="btn btn-xs btn-info miconbtn" title="编辑" onclick="devgetoperaterightfun(' + i + ');">'+
                                                    '<span class="glyphicon glyphicon-hand-up"></span><span class="glyphicon  glyphicon-transfer"></span>'+
                                                '</button>'+
                                            '</li>'+
                                            '<li id="tableViewDevInfoli' + i + '">'+
                                                '<button class="btn btn-xs btn-success miconbtn" title="查看设备信息" onclick="devotherinfofun(' + i + ');">'+
                                                    '<span class="glyphicon glyphicon-zoom-in"></span>'+
                                                '</button>'+
                                            '</li>'+
                                            '<li id="tableEnterDevControlli' + i + '">'+
                                                '<button class="btn btn-xs btn-primary miconbtn" title="进入控制面板" onclick="EnterDevControlfun(' + i + ');">'+
                                                    '<span class="glyphicon glyphicon-hand-up"></span><span class="glyphicon glyphicon-wrench"></span>'+
                                                '</button>'+
                                            '</li>'+
                                        '</ul>'+
                                    '</div>'+
                                '</div>';
        Cell_9.id = "DevTablebtn" + i;
    };
    $("#gridviewli").removeClass('active');
    $("#tableviewli").addClass('active');
}

//获取设备其他信息
function devotherinfofun(num){
    var Devnametmp = $("#Devname" + num).text();
    var Devcodetmp = gDeviceCode[num];
    $.ajax({
        url:('/webmc/devinfo/'+ Devcodetmp),
        type:'GET',
        success:function(argv){
            var obj = jQuery.parseJSON(argv);
            console.log(obj);
            $('#myModaltitleLabel').text(Devnametmp + ' 设备的其他信息');
            document.getElementById("myModelBodyDiv").innerHTML = '<div class="row"><div class="col-md-9 col-md-offset-1"><form class="form-horizontal" role="form">'+
                                                                  '<div class="form-group"><label class="col-sm-4 control-label">设备序列号</label><div class="col-sm-8"><span class="form-control">' + Devcodetmp + '</span></div></div>'+
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


var gCurOpenDevtype;
var gCurOpenDevcode;
var gCurOpenDevShowtype;
//进入设备控制面板
function EnterDevControlfun(num){
    gCurOpenDevcode = gDeviceCode[num];
    $.ajax({
        url:('/dev/U/devcontrolinfo/'+ gCurOpenDevcode),
        type:'GET',
        success:function(obj){
            //var obj = jQuery.parseJSON(argv);
            console.log(obj);
            var prjappPathname=obj.prjapppathname;
            gCurOpenDevtype=obj.devtype;
            gCurOpenDevShowtype=obj.devshowtype;
            loadXMLDoc(prjappPathname,"myModelBodyDivapp");
            document.getElementById("myModaltitleLabelapp").innerHTML='<h3 style="font-weight:bold;">'+obj.devname+'&nbsp;<span style="font-size:15px; font-weight:normal;" >控制面板</span></h3>';
            //$('#myModaltitleLabelapp').text(obj.devname + ' 的控制面板');
            //document.getElementById("myModelBodyDiv").innerHTML = '';
            //document.getElementById("myModalFooterapp").innerHTML = '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
            //document.getElementById("myModalFooterapp").innerHTML ="";
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
            document.getElementById("buttonmodelapp").click();
            appCommonInit(gCurOpenDevtype,gCurOpenDevShowtype);
        }
    }
    //xmlhttp.open("GET", "ajaxtest.txt?t=" + Math.random(), true);
    xmlhttp.open("GET", prjapppathname + '?t=' + Math.random(), true);
    xmlhttp.send();
}