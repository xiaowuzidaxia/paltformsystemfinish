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
            devlistfun("grid");
        }
    }); 
    gCurOpenDevcode = -1;
    gCurOpenDevtype = -1;
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


function clearmodelcssfun(){
    $('#myModelBodyDiv').removeClass("fail");
    $('#myModelBodyDiv').removeClass("suc");
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
    var devicecodetmp = gDeviceCode[num];
    var data = {'companyname':companyname,'username':username,'operatepassword':operatepassword,'devicecode':devicecodetmp};
    var temp = JSON.stringify(data);
    $.ajax({
        url: '/dev/U/operateright/',
        type: 'POST',
        data:{dat:temp},
        success: function (obj) {
            //var obj = jQuery.parseJSON(argv);
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
var gDevRunProgressCode = new Array();
var gDevProcessDsc = new Array();
var gDevListShowView = 'grid';
//获取设备信息
function devlistfun(type){  
    var data = {'companyname':companyname,'username':username,'type':type};
    //var data = {'companyname':"hangzhou",'username':"xiao",'type':type};
    var temp = JSON.stringify(data);
    console.log(temp);
    var tmp=JSON.parse(temp);
    console.log(tmp);
    console.log('message2: ' + tmp.companyname);
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
            gDevListShowView = type;
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
    gDeviceCode=[];
    gDevRunProgressCode=[];
    gDevProcessDsc=[];
    for (var i = 0; i < obj.devicecode.length; i++) {
        gDeviceCode.push(obj.devicecode[i]);
        gDevRunProgressCode.push(obj.devicerunprogresscode[1][i]);
        gDevProcessDsc.push(0);
        txttmp = txttmp + '<div class="col-sm-6 col-md-4"><a class="thumbnail girda">'+
        '<div class="gridtitle" id="gridtitle'+i+'" onclick="EnterDevControlfun('+i+')"><img src="'+obj.imgpath[i]+'" class="gridimg"><h3 id="Devname'+i+'">'+obj.devicename[i]+'</h3>'+
        '<br /></div><form class="form-horizontal" role="form"><br />'+
        '<div class="form-group"><label class="col-sm-4 control-label">生命状态</label><div class="col-sm-8"><span class="form-control" id="Devlifestate'+i+'">'+obj.devicelifestatecode[i]+'</span></div></div>'+
        '<div class="form-group"><label class="col-sm-4 control-label">运行状态</label><div class="col-sm-8"><input class="form-control" type="text" readonly="readonly" id="DevRunstate'+i+'" value="'+obj.devicerunstatecode[0][i]+'"></div></div>'+
        '<div class="form-group"><label class="col-sm-4 control-label">运行进度</label><div class="col-sm-8"><div class="progress">'+
        '<span style="z-index:1; position:absolute; color:black; line-height:30px; margin-left:10px;" id="DevRunprogressTxt'+i+'">'+obj.devicerunprogresscode[1][i]+'%: '+obj.devicerunprogresscode[0][i]+'</span>'+
        '<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width:'+obj.devicerunprogresscode[1][i]+'%;" id="DevRunprogress'+i+'">'+
        '</div></div></div></div>'+
        '<div class="form-group"><label class="col-sm-4 control-label">日成品数(个)</label><div class="col-sm-8"><input class="form-control" type="text" readonly="readonly" id="DevDaySucOperatesum'+i+'" value="'+obj.devicedaysucoperatesum[i]+'"></div></div>'+
        '<div class="form-group"><label class="col-sm-4 control-label">日废品数(个)</label><div class="col-sm-8"><span class="form-control" id="DevDayFailOperatesum'+i+'">'+obj.devicedayfailoperatesum[i]+'</span></div></div>'+
        '<div class="form-group"><label class="col-sm-4 control-label">日工作时长(时)</label><div class="col-sm-8"><input class="form-control" type="text" readonly="readonly" id="DevDayWorktime'+i+'" value="'+obj.devicedayworktime[i]+'"></div></div>'+
        '<div class="form-group"><div class="col-sm-6"><input type="button" value="获取该设备操作权限" class="btn btn-info btn-block" title="获取该设备操作权限" onclick="devgetoperaterightfun('+i+')" /> </div>'+
        '<div class="col-sm-6"><input type="button" value="查看设备其他信息" class="btn btn-info btn-block" title="查看设备其他信息" onclick="devotherinfofun('+i+')" /> </div></div>'+
        '</form></a></div>';
    };
    document.getElementById("devgridview").innerHTML = txttmp;
    for (var i = 0; i < obj.devicecode.length; i++) {
        if(obj.devicerunstatecode[1][i]>2000){
            $("#DevRunstate"+i).val(obj.devicerunstatecode[0][i]+' code:'+obj.devicerunstatecode[1][i]);
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
    gDeviceCode=[];
    gDevRunProgressCode=[];
    gDevProcessDsc=[];
    for (var i = 0; i < obj.devicecode.length; i++) {
        gDeviceCode.push(obj.devicecode[i]);
        gDevRunProgressCode.push(obj.devicerunprogresscode[1][i]);
        gDevProcessDsc.push(0);
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
        Cell_4.innerHTML = obj.devicerunstatecode[0][i];
        Cell_4.id = "DevRunstate" + i;

        var Cell_5=tableRow.insertCell(5);
        Cell_5.innerHTML = '<div class="progress" style="width:150px">'+//obj.devicerunprogresscode[i];
        '<span style="z-index:1; position:absolute; color:black; line-height:30px;" id="DevRunprogressTxt'+i+'">'+obj.devicerunprogresscode[1][i]+'%: '+obj.devicerunprogresscode[0][i]+'</span>'+
        '<div class="progress-bar progress-bar-success" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width:'+obj.devicerunprogresscode[1][i]+'%;" id="DevRunprogressPar'+i+'">'+
        '</div></div>';
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
    if(obj.devicerunstatecode[1][i]>20000){
        document.getElementById("DevRunstate"+i).innerHTML=obj.devicerunstatecode[0][i];+' code:'+obj.devicerunstatecode[1][i];
    }
    $("#gridviewli").removeClass('active');
    $("#tableviewli").addClass('active');
}

//获取设备其他信息
function devotherinfofun(num){
    var Devnametmp = $("#Devname" + num).text();
    var Devcodetmp = gDeviceCode[num];
    $.ajax({
        url:('/dev/U/devinfo/'+ Devcodetmp),
        type:'GET',
        success:function(obj){
            //var obj = jQuery.parseJSON(argv);
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
var gCurOpenRownum;
//进入设备控制面板
function EnterDevControlfun(num){
    gCurOpenDevcode = gDeviceCode[num];
    gCurOpenRownum = num;
    getDevControlInfofun(gCurOpenDevcode);
}
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
            console.log(obj);
            var prjappPathname = obj.prjapppathname;
            gCurOpenDevtype = obj.devtype;
            gCurOpenDevShowtype = obj.devshowtype;
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

function ExitDevControlfun(){
    gCurOpenDevcode = -1;
    gCurOpenDevtype = -1;
    gGetCalDataflag = false;
}

var gExeRunValue = 80;
var gUserExeValue = 60;
var gGetCalDataflag = false;
//执行过程的路径位置点
function DevProcessExePathtpfun(obj){
    var i;
    var pathlength = xStartList.length;
    for (var i = 0; i < gDeviceCode.length; i++) {
        if(gDeviceCode[i]==obj.Devid){
            obj.Data=JSONparse(obj.Data);
            gDevProcessDsc[i] = obj.Data.index-1;
            if(gDevRunProgressCode [i]== gExeRunValue && gDevProcessDsc[i]>0 && pathlength>0){
                var pradistmp =gDevRunProgressCode[i]*100/pathlength;
                var distmp = pradistmp+'%: '+obj.Data.devicerunprogress;
                $("#DevRunprogressTxt"+i).text(distmp);
                $("#DevRunprogressPar"+i).css({width:pradistmp+'%'});
            }
            break;
        }
    }
    if(gCurOpenDevcode == obj.Devid){//进度不同动态过程的状不同
        if(gDevRunProgressCode[gCurOpenRownum] == gExeRunValue && pathlength>=gDevProcessDsc[gCurOpenRownum]){
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
            if(gDevListShowView=="grid"){
                if(obj.Data.devicerunstatecode>20000){
                    $("#gridtitle"+i).addClass('unnormal');
                    $("#DevRunstate"+i).val(obj.Data.devicerunstatecode+' code:'+obj.Data.devicerunstate);
                }else{
                    $("#DevRunstate"+i).val(obj.Data.devicerunstatecode);
                    $("#gridtitle"+i).addClass('normal');
                }
            }else if(gDevListShowView=="table"){
                if(obj.Data.devicerunstatecode>20000){
                    document.getElementById("DevRunstate"+i).innerHTML=obj.Data.devicerunstatecode+' code:'+obj.Data.devicerunstate;
                }else{
                    document.getElementById("DevRunstate"+i).innerHTML=obj.Data.devicerunstatecode;
                }
            }
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
            var distmp = obj.Data.devicerunprogresscode+'%: '+obj.Data.devicerunprogress;
            $("#DevRunprogressTxt"+i).text(distmp);
            $("#DevRunprogressPar"+i).css({width:obj.Data.devicerunprogresscode+'%'});
            break;
        }
    }
    if(gCurOpenDevcode == obj.Devid){//进度不同所状态不同
        DevCurExeInfo(gCurOpenDevShowtype);
        /*if(obj.Data.devicerunprogresscode[1] == gUserExeValue || obj.Data.devicerunprogresscode[1] == gExeRunValue){//当前的进度值
            if(gGetCalDataflag){
                return;
            }

            if(gCurOpenDevtype == gAppCanvasDevtype){
                for (i = 0; i < xStartList.length; i++) {
                    xStartList[i]=xStartList[i]*gPicScale;
                    yStartList[i]=yStartList[i]*gPicScale;
                    xEndList[i]=xEndList[i]*gPicScale;
                    yEndList[i]=yEndList[i]*gPicScale;
                }
                if(obj.Data.devicerunprogresscode[1]==gUserExeValue){
                    gGetCalDataflag=false;
                    redrawline();
                }else{
                    gGetCalDataflag=true;
                    DrawLinePath();
                }
                
            }else if(gCurOpenDevtype == gAppScrewDevtype){
                for (i = 0; i < xStartList.length; i++) {
                    xStartList[i]=xStartList[i]*gPicScale;
                    yStartList[i]=yStartList[i]*gPicScale;
                    xEndList[i]=((xEndList[i]-xStartList[i])*gConnectorLength+xStartList[i])*gPicScale;
                    yEndList[i]=((yEndList[i]-yStartList[i])*gConnectorLength+yStartList[i])*gPicScale;
                }
                if(obj.Data.devicerunprogresscode[1]==gUserExeValue){
                    gGetCalDataflag=false;
                    redrawconnector();
                }else{
                    gGetCalDataflag=true;
                    DrawConnectorPath();
                }
                
            }
        }else if(obj.Data.devicerunprogresscode[1]==0){
            gGetCalDataflag=false;
            Picturepathtmp = "http://192.168.1.161:8080/down/1.png";
            load(Picturepathtmp); 
        }*/
    }
}

//识别图片的实时地址
function CurrentPicAddrtpfun(obj){
    if(gCurOpenDevcode == obj.Devid){
        Picturepathtmp = obj.Data.CurrentPicAddr;
        load(Picturepathtmp); 
        /*if(gCurOpenDevtype == gAppCanvasDevtype){
            redrawline();
        }else if(gCurOpenDevtype == gAppScrewDevtype){
            redrawconnector();
        }*/
    }
}

//
/*function CalDatatpfun(obj){
    if(gCurOpenDevcode == obj.Devid){//数据填入
        if(true){//当前的进度值
            xStartList=[];
            yStartList=[];
            xEndList=[];
            yEndList=[];
            for (var i = 0; i < obj.data.LineList.length; i++) {
                xStartList.push(obj.data.LineList[i].x0);
                yStartList.push(obj.data.LineList[i].y0);
                xEndList.push(obj.data.LineList[i].x1);
                yEndList.push(obj.data.LineList[i].y1);
            }
        }
    }
}*/

//设备操作者改变处理
function DevOpertorChangetpfun(obj){
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
            if(gDevListShowView=="grid"){
                $("#DevDaySucOperatesum"+i).val(obj.Data.devicedaysucoperatesum);
                $("#DevDayFailOperatesum"+i).text(obj.Data.devicedayfailoperatesum);
            }else if(gDevListShowView=="table"){
                document.getElementById("DevDaySucOperatesum"+i).innerHTML=obj.Data.devicedaysucoperatesum;
                document.getElementById("DevDayFailOperatesum"+i).innerHTML=obj.Data.devicedayfailoperatesum;
            }
        }
    }
}

//累计的工作时间
function DevDayWorktimetpfun(obj){
    var i;
    for (i = 0; i < gDeviceCode.length; i++) {
        if(gDeviceCode[i]==obj.Devid){
            if(gDevListShowView=="grid"){
                $("#DevDayWorktime"+i).val(obj.Data.devicedayworktime);
            }else if(gDevListShowView=="table"){
                document.getElementById("DevDayWorktime"+i).innerHTML=obj.Data.devicedayworktime;
            }
        }
    }
}
//与服务器之间的通讯
$(function(){
    if ("WebSocket" in window)
    {
        if(window.s){
            window.s.close();
        }
        var s = new WebSocket("ws://192.168.1.114:8080/dev/U/echo/");
        s.onopen = function () {
            console.log('WebSocket open');
        };
        s.onmessage = function (e) {
            console.log('message: ' + e.data);
            var obj = JSON.parse(e.data);
            console.log('message1: ' + obj.WSSType);
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
                case 'devprocessfintp '://运行完成一个
                DevProcessfintpfun(obj);
                break;
                case 'devdayworktimetp'://设备工作时间达到一小时推送
                DevDayWorktimetpfun(obj);
                break;
                default:
                break;
            }
        };
        s.onclose = function()
        { 
            // 关闭 websocket
            console.log("连接已关闭..."); 
        };
        window.s = s;
    }else{
        alert("您的浏览器不支持 WebSocket!");
    }
});