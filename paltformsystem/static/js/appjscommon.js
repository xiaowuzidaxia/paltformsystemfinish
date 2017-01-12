//画布
var canvas ;
var context ;
//蒙版
var canvas_bak;
var context_bak;

var canvasWidth = 980;
var canvasHeight = 600;

var canvasTop;
var canvasLeft;

//画笔大小
var size = 1;
var color  = '#000000';
var choosedcolor = '#ff0000';
var fontsize = "bold 20px sans-serif"

var xStartList = new Array();
var yStartList = new Array();
var xEndList = new Array();
var yEndList = new Array();
var newdrawclick = true;

var gConnectorLength = 30;
var gAppCanvasDevtype = "画布";
var gAppScrewDevtype = "打螺钉";

var downchoosed = {
	'choosedstate': 'none',
	'choosednum': -1,
	'pointx': 0,
	'pointy': 0,
	'pointex':0,
	'pointey':0
};
var movechoosed = {
	'choosedstate': 'none',
	'choosednum': -1,
	'pointx': 0,
	'pointy': 0,
	'pointex':0,
	'pointey':0
};
////加入图片变量
var gPicture = new Image(); 
var Picturepathtmp = "http://192.168.1.161:8080/down/1.png";
var gPicScale = 1;
var gDsx = 0;
var gDsy = 0;

var gDrawFlag=false;

//进入控制面板的初始化
function appCommonInit(CurOpenDevtype, CurOpenShowtype){
	if(CurOpenDevtype == gAppCanvasDevtype){
		newdrawclick = true;
		xStartList=[];
		yStartList=[];
		xEndList=[];
		yEndList=[];
		initCanvas();
	}else if(CurOpenDevtype == gAppScrewDevtype){
		newdrawclick = true;
		xStartList=[];
		yStartList=[];
		xEndList=[];
		yEndList=[];
		initCanvas();
	}
	//if(CurOpenShowtype == "ctrl"){
		DevCurControlInfo(CurOpenShowtype);
		//$("#operatecheckbox").attr("checked", false);
	//}
}

//初始化
var initCanvas = function(){
    canvas =  document.getElementById("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context = canvas.getContext('2d');


    canvas_bak =  document.getElementById("canvas_bak");
    canvas_bak.width = canvasWidth;
    canvas_bak.height = canvasHeight;
    context_bak = canvas_bak.getContext('2d');   
    //load(Picturepathtmp);   
    context.font = fontsize;
} 

//选择画
function drawclickfun(type){
	if(!gDrawFlag){
    	return;
    }
	if(newdrawclick){
		$("#drawbtnid").addClass('clickedappbtn');
		document.getElementById("canvas_bak").style.cursor="crosshair"; 
		if(type == 'line'){
			draw_graph_line("line");
		}else if(type == 'connector'){
			draw_graph_connector("connector");
		}
		newdrawclick = false;
	}else{
		$("#drawbtnid").removeClass('clickedappbtn');
		document.getElementById("canvas_bak").style.cursor="default"; 
		if(type == 'line'){
			draw_graph_line("cancel");
		}else if(type == 'connector'){
			draw_graph_connector("cancel");
		}
		newdrawclick = true;
	}
}

function draw_graph_line(graphType){
	var canDraw = false;
	var canDrawPoint = false;
	var startX;
	var startY;
	var endX;
	var endY;
	var outRange = false;
	downchoosed = {
		'choosedstate': 'none',
		'choosednum': -1,
		'pointx': 0,
		'pointy': 0,
		'pointex':0,
		'pointey':0
	};
	movechoosed = {
		'choosedstate': 'none',
		'choosednum': -1,
		'pointx': 0,
		'pointy': 0,
		'pointex':0,
		'pointey':0
	};
	context.strokeStyle = color;
	context.lineWidth = size;
	context_bak.strokeStyle = color;
	context_bak.lineWidth = size;
	canvasTop = Number($(canvas).offset().top) - Number($(window).scrollTop());
    canvasLeft = Number($(canvas).offset().left) - Number($(window).scrollLeft());

    if(!gDrawFlag){
    	return;
    }
    


	var mousedown = function(e){
		canvasTop = Number($(canvas).offset().top) - Number($(window).scrollTop());
		canvasLeft = Number($(canvas).offset().left) - Number($(window).scrollLeft());
		e = e||window.event;
		startX = e.clientX - canvasLeft;
		startY = e.clientY - canvasTop;	
		if(outrange(startX,startY)){
			outRange = true;
			return;
		}else{
			outRange = false;
		}	
		if(graphType == 'line'){
			context_bak.beginPath();
			context_bak.moveTo(startX ,startY);	
			canDraw = true;
		}else if(graphType == 'cancel'){
			downchoosed = ongraphfun('line',startX+gDsx,startY+gDsy,4);
			if(downchoosed.choosedstate == 'line'){
				canDraw = true;
			}else if(downchoosed.choosedstate == 'point'){
				canDraw = true;
				canDrawPoint = true;
			}
		}
	}

	var mouseup = function(e){
		canDraw = false;
		canDrawPoint = false;
		if(outrange(endX,endY)){
			return;
		}else{
			if(outRange){
				return;
			}
		}
		if(graphType == 'line'){
			/*var image = new Image();	
			image.src = canvas_bak.toDataURL();
			image.onload = function(){
				context.drawImage(image , 0 ,0 , image.width , image.height , 0 ,0 , parseInt(canvasWidth) , parseInt(canvasHeight));
				clearContext();
			}*/
			if(startX==endX && startY==endY){
				return;
			}
			context.beginPath();
			context.moveTo(startX ,startY);	
			context.lineTo(endX,endY);
			context.stroke();
			xStartList.push(startX+gDsx);
			yStartList.push(startY+gDsy);
			xEndList.push(endX+gDsx);
			yEndList.push(endY+gDsy);
		}else if(graphType == 'cancel'){
			clearContext();
			movechoosed = ongraphfun('line',endX+gDsx,endY+gDsy,4);
			if(movechoosed.choosedstate != 'none'){
				//var dvtmp = 4;
				var numtmp = movechoosed.choosednum;
				/*if(movechoosed.choosedstate == 'line'){
					if(movechoosed.choosednum == downchoosed.choosednum){
						var dxtmp = endX - startX;
						var dytmp = endY - startY;
						xStartList[numtmp] = downchoosed.pointx + dxtmp;
						yStartList[numtmp] = downchoosed.pointy + dytmp;
						xEndList[numtmp] = downchoosed.pointex + dxtmp;
						yEndList[numtmp] = downchoosed.pointey + dytmp;
						redrawline();
					}
				}else if(movechoosed.choosedstate == 'point'){
					if(movechoosed.pointx == xStartList[numtmp] && movechoosed.pointy == yStartList[numtmp]){
						xStartList[numtmp] = endX;
						yStartList[numtmp] = endY;
					}else if(movechoosed.pointx == xEndList[numtmp] && movechoosed.pointy == yEndList[numtmp]){
						xEndList[numtmp] = endX;
						yEndList[numtmp] = endY;
					}
					redrawline();
				}*/
				drawrectangle(numtmp);
			}
			//downchoosed.choosedstate = 'none';
			//downchoosed.choosednum = -1;
			movechoosed.choosedstate = 'none';
			movechoosed.choosednum = -1;
			//document.getElementById("canvas_bak").style.cursor="default"; 
		}
	}

	var  mousemove = function(e){
		canvasLeft=Number($(canvas).offset().left) - Number($(window).scrollLeft());
		canvasTop=Number($(canvas).offset().top) - Number($(window).scrollTop());
		e=e||window.event;
		endX = e.clientX   - canvasLeft;
		endY = e.clientY  - canvasTop;
		if(graphType == 'line'){
			if(canDraw){
				if(outrange(endX,endY)){
					return;
				}else{
					if(outRange){
						return;
					}
				}
				if(startX==endX && startY==endY){
					return;
				}	
				clearContext();
				context_bak.beginPath();
				context_bak.moveTo(startX, startY);
				context_bak.lineTo(endX, endY);
				context_bak.stroke();
			}	
		}else if(graphType == 'cancel'){
			if(canDraw == false){
				movechoosed = ongraphfun('line',endX+gDsx,endY+gDsy,4);
			}else{
				if((movechoosed.choosednum  != downchoosed.choosednum) && (canDrawPoint == false)){
					movechoosed = ongraphfun('line',endX+gDsx,endY+gDsy,4);
				}
			}
			if(movechoosed.choosedstate == 'none'){
				document.getElementById("canvas_bak").style.cursor="auto"; 
			}
			else{
				if(outrange(endX,endY)){
					return;
				}else{
					if(outRange){
						return;
					}
				}
				var numtmp = movechoosed.choosednum;
				if(movechoosed.choosedstate == 'line'){
					document.getElementById("canvas_bak").style.cursor="move"; 
					if(canDraw && (movechoosed.choosednum == downchoosed.choosednum)){
						var dxtmp = endX - startX;
						var dytmp = endY - startY;
						if(outrange(downchoosed.pointx - gDsx + dxtmp,downchoosed.pointy - gDsy+ dytmp) || outrange(downchoosed.pointex - gDsx + dxtmp,downchoosed.pointey - gDsy + dytmp)){
							return;
						}else{
							xStartList[numtmp] = downchoosed.pointx + dxtmp;
							yStartList[numtmp] = downchoosed.pointy + dytmp;
							xEndList[numtmp] = downchoosed.pointex + dxtmp;
							yEndList[numtmp] = downchoosed.pointey + dytmp;
							redrawline();
							drawrectangle(numtmp);
						}	
					}
				}else if(movechoosed.choosedstate == 'point'){
					//if(movechoosed.choosednum == downchoosed.choosednum){
						var ktmp = (yEndList[numtmp] - yStartList[numtmp])/(xEndList[numtmp] - xStartList[numtmp]);
						if(ktmp > 0 && ktmp <100){
							document.getElementById("canvas_bak").style.cursor="se-resize"; 
						}else if(ktmp < 0 && ktmp > -100){
							document.getElementById("canvas_bak").style.cursor="ne-resize"; 
						}else if(ktmp == 0){
							document.getElementById("canvas_bak").style.cursor="w-resize"; 
						}else{
							document.getElementById("canvas_bak").style.cursor="s-resize";
						}
						if(canDrawPoint == true){
							//var dxtmp = endX - startX;
							//var dytmp = endY - startY;
							if(movechoosed.pointex == xStartList[numtmp] && movechoosed.pointey == yStartList[numtmp]){
								//xEndList[numtmp] = downchoosed.pointx + dxtmp;
								//yEndList[numtmp] = downchoosed.pointy + dytmp;
								if(xStartList[numtmp] == (endX+gDsx) && yStartList[numtmp] == (endY+gDsy)){
									return;
								}
								xEndList[numtmp] = endX+gDsx;
								yEndList[numtmp] = endY+gDsy;
							}else if(movechoosed.pointex == xEndList[numtmp] && movechoosed.pointey == yEndList[numtmp]){
								if(xEndList[numtmp] == (endX+gDsx) && yEndList[numtmp] == (endY+gDsy)){
									return;
								}
								xStartList[numtmp] = endX+gDsx;
								yStartList[numtmp] = endY+gDsy;
								//xStartList[numtmp] = downchoosed.pointx + dxtmp;
								//yStartList[numtmp] = downchoosed.pointy + dytmp;
							}
							document.getElementById("canvas_bak").style.cursor="crosshair"; 
							redrawline();
							drawrectangle(numtmp);
						}		
					//}
				}
			} 
		}
	}

	var drawrectangle = function(numtmp){
		var dvtmp = 4;
		context_bak.strokeStyle = choosedcolor;
		context_bak.beginPath();
		context_bak.moveTo(xStartList[numtmp] - gDsx - dvtmp ,yStartList[numtmp] - gDsy - dvtmp);	
		context_bak.lineTo(xStartList[numtmp] - gDsx + dvtmp, yStartList[numtmp] - gDsy - dvtmp);
		context_bak.lineTo(xStartList[numtmp] - gDsx + dvtmp, yStartList[numtmp] - gDsy + dvtmp);
		context_bak.lineTo(xStartList[numtmp] - gDsx - dvtmp, yStartList[numtmp] - gDsy + dvtmp);
		context_bak.lineTo(xStartList[numtmp] - gDsx - dvtmp, yStartList[numtmp] - gDsy - dvtmp);
		context_bak.moveTo(xEndList[numtmp] - gDsx - dvtmp ,yEndList[numtmp] - gDsy - dvtmp);	
		context_bak.lineTo(xEndList[numtmp] - gDsx + dvtmp, yEndList[numtmp] - gDsy - dvtmp);
		context_bak.lineTo(xEndList[numtmp] - gDsx + dvtmp, yEndList[numtmp] - gDsy + dvtmp);
		context_bak.lineTo(xEndList[numtmp] - gDsx - dvtmp, yEndList[numtmp] - gDsy + dvtmp);
		context_bak.lineTo(xEndList[numtmp] - gDsx - dvtmp, yEndList[numtmp] - gDsy - dvtmp);
		context_bak.moveTo(xStartList[numtmp] - gDsx ,yStartList[numtmp]- gDsy);	
		context_bak.lineTo(xEndList[numtmp] - gDsx , yEndList[numtmp]- gDsy);
		context_bak.stroke();
		context_bak.strokeStyle = color;
	}

	var mouseout = function(){
		if(graphType == 'line'){
			//canDraw = false;
			clearContext();
		}else if(graphType == 'cancel'){
			
		}
	}
	$(canvas_bak).unbind();
	$(canvas_bak).bind('mousedown',mousedown);
	$(canvas_bak).bind('mousemove',mousemove);
	$(canvas_bak).bind('mouseup',mouseup);
	$(canvas_bak).bind('mouseout',mouseout);
}

function load(picturepath){
	gPicture.src = picturepath+ "?tempid="+Math.random();
	var xscaletmp;
	var yscaletmp;
	gPicture.onload = function(){
		xscaletmp = gPicture.width/canvasWidth;
		yscaletmp = gPicture.height/canvasHeight;
		if(xscaletmp>yscaletmp){
			gPicScale = xscaletmp;
		}else{
			gPicScale = yscaletmp;
		}
		gDsx=(gPicture.width/gPicScale-canvasWidth)/2;
		gDsy=(gPicture.height/gPicScale-canvasHeight)/2;
		drawPicture(gPicture);
	};
	gPicture.onerror = function(){
		window.alert('图片加载失败，请重试');
	}; 
}

function drawPicture(picture){
	clearContext('1');
	context.strokeStyle = '#00ff00';
	context.lineWidth = size*3;
	if(picture.complete)
	{		
		context.drawImage(picture, gPicScale*gDsx, gPicScale*gDsy, gPicScale*canvasWidth, gPicScale*canvasHeight, 0, 0, canvasWidth, canvasHeight);
		context.beginPath();
		var tx,ty;
		tx=Math.abs(gDsx);
		ty=Math.abs(gDsy);
		context.moveTo(tx,ty);
		context.lineTo(canvasWidth-tx,ty);
		context.lineTo(canvasWidth-tx,canvasHeight-ty);
		context.lineTo(tx,canvasHeight-ty);
		context.lineTo(tx,ty);
		context.stroke();
	}else{
		load();
	}
	context.strokeStyle = color;
	context.lineWidth = size;
}

var outrange = function(ptx,pty){
	var tx,ty;
	tx=Math.abs(gDsx);
	ty=Math.abs(gDsy);
	if(ptx<tx || ptx>canvasWidth-tx){
		clearContext();
		return true;
	}
	if(pty<ty || pty>canvasHeight-ty){
		clearContext();
		return true;
	}
	return false;
}

function specialongraphfun(grapytype,ptx,pty,pallowdv,i){
	var tp1X = 0.0;
    var tp1Y = 0.0;
    var tp2X = 0.0;
    var tp2Y = 0.0;
    var l = 0.0;
    var s = 0.0;
    var choosed = {
		'choosedstate': 'none',
		'choosednum': -1,
		'pointx': 0,
		'pointy': 0,
		'pointex':0,
		'pointey':0
	};
	if (Math.abs(ptx - xStartList[i]) <= pallowdv && Math.abs(pty - yStartList[i]) <= pallowdv){
		choosed.choosedstate = 'point';
		choosed.choosednum = i;
		choosed.pointx = xStartList[i];
		choosed.pointy = yStartList[i];
		choosed.pointex = xEndList[i];
		choosed.pointey = yEndList[i];
		return choosed;
	}else if(Math.abs(ptx - xEndList[i]) <= pallowdv && Math.abs(pty - yEndList[i]) <= pallowdv){
		choosed.choosedstate = 'point';
		choosed.choosednum = i;
		choosed.pointx = xEndList[i];
		choosed.pointy = yEndList[i];
		choosed.pointex = xStartList[i];
		choosed.pointey = yStartList[i];
		return choosed;
	}else if(Math.min(xStartList[i], xEndList[i]) <= (ptx+pallowdv) && Math.min(yStartList[i], yEndList[i]) <= (pty+pallowdv) && Math.max(xStartList[i], xEndList[i]) >= (ptx-pallowdv) && Math.max(yStartList[i], yEndList[i]) >= (pty-pallowdv)){
		if(grapytype == 'line'){
			tp1X = xEndList[i] - ptx;
	        tp1Y = yEndList[i] - pty; 
	        tp2X = ptx - xStartList[i];
	        tp2Y = pty - yStartList[i];  
			if (Math.abs(pallowdv - 0.0) <= 0.0001)
	        {
	            if (Math.abs(Math.abs(tp1X * tp2Y - tp2X * tp1Y) - 0.0) <= 0.00000001){
	            	choosed.choosedstate = 'line';
					choosed.choosednum = i;
					choosed.pointx = xStartList[i];
					choosed.pointy = yStartList[i];
					choosed.pointex = xEndList[i];
					choosed.pointey = yEndList[i];
	                return choosed;
	            }
	        }
	        else
	        {
	        	l = Math.sqrt(Math.pow(xEndList[i] - xStartList[i], 2) + Math.pow(yEndList[i] - yStartList[i], 2));
				s = (tp1X * tp2Y - tp2X * tp1Y) / (l * l);
	            if ((Math.abs(s) * l) <= pallowdv){
	            	choosed.choosedstate = 'line';
					choosed.choosednum = i;
					choosed.pointx = xStartList[i];
					choosed.pointy = yStartList[i];
					choosed.pointex = xEndList[i];
					choosed.pointey = yEndList[i];
	                return choosed;
	            }
	        }
		}else if(grapytype == 'connector'){
			choosed.choosedstate = 'connector';
			choosed.choosednum = i;
			choosed.pointx = xStartList[i];
			choosed.pointy = yStartList[i];
			choosed.pointex = xEndList[i];
			choosed.pointey = yEndList[i];
            return choosed;
		}
		
	} 
	return choosed;     
}

function ongraphfun(graphtype,ptx,pty,pallowdv){
    var choosed = {
		'choosedstate': 'none',
		'choosednum': -1,
		'pointx': 0,
		'pointy': 0,
		'pointex':0,
		'pointey':0
	};
	var i = 0;
	if((downchoosed.choosednum >= 0) && (movechoosed.choosednum == downchoosed.choosednum)){
		i = downchoosed.choosednum ;
		choosed = specialongraphfun(graphtype,ptx,pty,pallowdv,i);
		if(choosed.choosednum > -1){
			return choosed;
		}
	}
	for (i = 0; i < xStartList.length; i++) {
		choosed = specialongraphfun(graphtype,ptx,pty,pallowdv,i);
		if(choosed.choosednum > -1){
			return choosed;
		}    
	} 
	return choosed;
}

function deletefun(type){
	if(!gDrawFlag){
    	return;
    }
	if(newdrawclick){
		if(downchoosed.choosedstate != 'none'){
			downchoosed.choosedstate = 'none';
			var numtmp = downchoosed.choosednum;
			xStartList.splice(numtmp,1); 
			yStartList.splice(numtmp,1); 
			xEndList.splice(numtmp,1); 
			yEndList.splice(numtmp,1); 
			if(type == 'line'){
				redrawline();
			}else if(type == 'connector'){
				redrawconnector();
			}
		}else{
			if(type == 'line'){
			$('#myModaltitleLabel').text("删'割线'");
			document.getElementById("myModelBodyDiv").innerHTML="请选中待删除的'割线'，再点击删'割线'按钮即可删除。";
			}else if(type == 'connector'){
				$('#myModaltitleLabel').text("删'角码'");
				document.getElementById("myModelBodyDiv").innerHTML="请选中待删除的'角码'，请点击删'角码'按钮即可删除。";
			}	
	        document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" data-dismiss="modal" onclick="clearmodelcssfun();">关闭</button>';
	        document.getElementById("buttonmodel").click();
	        $('#myModelBodyDiv').addClass("fail");
			}
	}else{
		if(type == 'line'){
			$('#myModaltitleLabel').text("删'割线'");
			document.getElementById("myModelBodyDiv").innerHTML="当前状态仍处于画'割线'状态，如需删'割线'，请再点击画'割线'按钮，然后选中待删除的'割线'，点击删'割线'按钮即可删除。";
		}else if(type == 'connector'){
			$('#myModaltitleLabel').text("删'角码'");
			document.getElementById("myModelBodyDiv").innerHTML="当前状态仍处于画'角码'状态，如需删'角码'，请再点击画'割线'按钮，然后选中待删除的'角码'，点击删'角码'按钮即可删除。";
		}	
        document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" data-dismiss="modal" onclick="clearmodelcssfun();">关闭</button>';
        document.getElementById("buttonmodel").click();
        $('#myModelBodyDiv').addClass("fail");
	}
}

function redrawline(){
	clearContext('1');
	//状态
	drawPicture(gPicture);
	for(var i=0 ;i<xStartList.length;i++){
		context.beginPath();
		context.moveTo(xStartList[i] - gDsx,yStartList[i] - gDsy);
		context.lineTo(xEndList[i] - gDsx,yEndList[i] - gDsy);	
		context.stroke();		
	}
}

/*function drawconnectorclickfun(){
	if(!gDrawFlag){
    	return;
    }
	if(newdrawclick){
		$("#drawbtnid").addClass('clickedappbtn');
		document.getElementById("canvas_bak").style.cursor="crosshair"; 
		draw_graph_connector("connector");
		newdrawclick = false;
	}else{
		$("#drawbtnid").removeClass('clickedappbtn');
		document.getElementById("canvas_bak").style.cursor="auto"; 
		draw_graph_connector("cancel")
		newdrawclick = true;
	}
}*/


function draw_graph_connector(graphType){
	var canDraw = false;
	var canDrawPoint = false;
	var startX;
	var startY;
	var endX;
	var endY;
	var outRange = false;
	downchoosed = {
		'choosedstate': 'none',
		'choosednum': -1,
		'pointx': 0,
		'pointy': 0,
		'pointex':0,
		'pointey':0
	};
	movechoosed = {
		'choosedstate': 'none',
		'choosednum': -1,
		'pointx': 0,
		'pointy': 0,
		'pointex':0,
		'pointey':0
	};
	var pstmp = {
		'x':0,
		'y':0
	};
	var petmp = {
		'x':0,
		'y':0
	};
	context.strokeStyle = color;
	context_bak.strokeStyle = color;
	context_bak.lineWidth = size;
	canvasTop = Number($(canvas).offset().top) - Number($(window).scrollTop());
    canvasLeft = Number($(canvas).offset().left) - Number($(window).scrollLeft());

    if(!gDrawFlag){
    	return;
    }

	var mousedown = function(e){
		canvasTop = Number($(canvas).offset().top) - Number($(window).scrollTop());
		canvasLeft = Number($(canvas).offset().left) - Number($(window).scrollLeft());
		e = e||window.event;
		startX = e.clientX - canvasLeft;
		startY = e.clientY - canvasTop;	
		if(outrange(startX,startY)){
			outRange = true;
			return;
		}else{
			outRange = false;
		}	
		if(graphType == 'connector'){
			//drawconnector('context_bak',startX,startY,startX+gConnectorLength,startY+gConnectorLength);
			canDraw = true;
		}else if(graphType == 'cancel'){
			downchoosed = ongraphfun('connector',startX + gDsx,startY + gDsy,4);
			if(downchoosed.choosedstate == 'connector'){
				canDraw = true;
			}else if(downchoosed.choosedstate == 'point'){
				canDraw = true;
				canDrawPoint = true;
			}
		}
	}

	var mouseup = function(e){
		canDraw = false;
		if(outrange(endX,endY)){
			return;
		}else{
			if(outRange){
				return;
			}
		}
		if(graphType == 'connector'){
			var image = new Image();	
			image.src = canvas_bak.toDataURL();
			image.onload = function(){
				context.drawImage(image , 0 ,0 , image.width , image.height , 0 ,0 , parseInt(canvasWidth) , parseInt(canvasHeight));
				clearContext();
			}
			if(canDrawPoint){
				if(endX == startX && endY == startY){
					return;
				}
				pstmp = {
					'x':startX,
					'y':startY
				};
				petmp = {
					'x':endX,
					'y':endY
				};
				petmp = getotherpointfun(pstmp,petmp,gConnectorLength);
				if(petmp.x<0 || petmp.y<0){
					redrawconnector();
					drawrectangle(numtmp);
					return;
				}
				endX = petmp.x;
				endY = petmp.y;
				canDrawPoint = false;
				xStartList.push(startX+gDsx);
				yStartList.push(startY+gDsy);
				xEndList.push(endX+gDsx);
				yEndList.push(endY+gDsy);
			}
			
		}else if(graphType == 'cancel'){
			canDrawPoint = false;
			clearContext();
			movechoosed = ongraphfun('connector',endX + gDsx,endY + gDsy,4);
			if(movechoosed.choosedstate != 'none'){
				//var dvtmp = 4;
				var numtmp = movechoosed.choosednum;
				/*if(movechoosed.choosedstate == 'line'){
					if(movechoosed.choosednum == downchoosed.choosednum){
						var dxtmp = endX - startX;
						var dytmp = endY - startY;
						xStartList[numtmp] = downchoosed.pointx + dxtmp;
						yStartList[numtmp] = downchoosed.pointy + dytmp;
						xEndList[numtmp] = downchoosed.pointex + dxtmp;
						yEndList[numtmp] = downchoosed.pointey + dytmp;
						redrawline();
					}
				}else if(movechoosed.choosedstate == 'point'){
					if(movechoosed.pointx == xStartList[numtmp] && movechoosed.pointy == yStartList[numtmp]){
						xStartList[numtmp] = endX;
						yStartList[numtmp] = endY;
					}else if(movechoosed.pointx == xEndList[numtmp] && movechoosed.pointy == yEndList[numtmp]){
						xEndList[numtmp] = endX;
						yEndList[numtmp] = endY;
					}
					redrawline();
				}*/
				if(movechoosed.choosednum = -1)
				drawrectangle(numtmp);
			}
			movechoosed.choosedstate = 'none';
			movechoosed.choosednum = -1;
		}
	}

	var  mousemove = function(e){
		canvasLeft=Number($(canvas).offset().left) - Number($(window).scrollLeft());
		canvasTop=Number($(canvas).offset().top) - Number($(window).scrollTop());
		e=e||window.event;
		endX = e.clientX   - canvasLeft;
		endY = e.clientY  - canvasTop;
		if(graphType == 'connector'){
			if(canDraw){
				if(outrange(endX,endY)){
					return;
				}else{
					if(outRange){
						return;
					}
				}
				if(endX == startX && endY == startY){
					return;
				}
				pstmp = {
					'x':startX,
					'y':startY
				};
				petmp = {
					'x':endX,
					'y':endY
				};
				petmp = getotherpointfun(pstmp,petmp,gConnectorLength);
				if(petmp.x<0 || petmp.y<0){
					redrawconnector();
					drawrectangle(numtmp);
					return;
				}
				canDrawPoint = true;
				endX = petmp.x;
				endY = petmp.y;
				drawconnector(context_bak,startX,startY,endX,endY);	
			}	
		}else if(graphType == 'cancel'){
			if(canDraw == false){
				movechoosed = ongraphfun('connector',endX + gDsx,endY + gDsy,4);
			}else{
				if((movechoosed.choosednum  != downchoosed.choosednum) && (canDrawPoint == false)){
					movechoosed = ongraphfun('connector',endX + gDsx,endY + gDsy,4);
				}
			}
			if(movechoosed.choosedstate == 'none'){
				document.getElementById("canvas_bak").style.cursor="auto"; 
			}
			else{
				if(outrange(endX,endY)){
					return;
				}else{
					if(outRange){
						return;
					}
				}
				var numtmp = movechoosed.choosednum;
				if(movechoosed.choosedstate == 'connector'){
					document.getElementById("canvas_bak").style.cursor="move"; 
					if(canDraw && (movechoosed.choosednum == downchoosed.choosednum)){
						var dxtmp = endX - startX;
						var dytmp = endY - startY;
						if(outrange(downchoosed.pointx - gDsx + dxtmp,downchoosed.pointy - gDsy + dytmp) || outrange(downchoosed.pointex - gDsx + dxtmp,downchoosed.pointey - gDsy + dytmp)){
							return;
						}else{
							xStartList[numtmp] = downchoosed.pointx + dxtmp;
							yStartList[numtmp] = downchoosed.pointy + dytmp;
							xEndList[numtmp] = downchoosed.pointex + dxtmp;
							yEndList[numtmp] = downchoosed.pointey + dytmp;
							redrawconnector();
							drawrectangle(numtmp);
						}					
					}
				}else if(movechoosed.choosedstate == 'point'){
					//if(movechoosed.choosednum == downchoosed.choosednum){
						var ktmp = (yEndList[numtmp] - yStartList[numtmp])/(xEndList[numtmp] - xStartList[numtmp]);
						if(ktmp > 0 && ktmp <100){
							document.getElementById("canvas_bak").style.cursor="se-resize"; 
						}else if(ktmp < 0 && ktmp > -100){
							document.getElementById("canvas_bak").style.cursor="ne-resize"; 
						}else if(ktmp == 0){
							document.getElementById("canvas_bak").style.cursor="w-resize"; 
						}else{
							document.getElementById("canvas_bak").style.cursor="s-resize";
						}
						if(canDrawPoint == true){
							pstmp = {
								'x':downchoosed.pointex,
								'y':downchoosed.pointey
							};
							petmp = {
								'x':downchoosed.pointx,
								'y':downchoosed.pointy
							};
							var distancetmp = pointdistancefun(pstmp,petmp);
							/*pstmp = {
								'x':movechoosed.pointex,
								'y':movechoosed.pointey
							};*/
							petmp = {
								'x':endX + gDsx,
								'y':endY + gDsy
							};
							petmp = getotherpointfun(pstmp,petmp,distancetmp);
							if(petmp.x<0 || petmp.y<0){
								redrawconnector();
								drawrectangle(numtmp);
								return;
							}
							if(movechoosed.pointex == xStartList[numtmp] && movechoosed.pointey == yStartList[numtmp]){
								xEndList[numtmp] = petmp.x;
								yEndList[numtmp] = petmp.y;
							}else if(movechoosed.pointex == xEndList[numtmp] && movechoosed.pointey == yEndList[numtmp]){
								xStartList[numtmp] = petmp.x;
								yStartList[numtmp] = petmp.y;
							}
							document.getElementById("canvas_bak").style.cursor="crosshair"; 
							redrawconnector();
							drawrectangle(numtmp);
						}		
					//}
				}
			} 
		}
	}

	var drawrectangle = function(numtmp){
		var dvtmp = 4;
		var ptmp = {
			'x':-1,
			'y':-1
		};
		var pstmp = {
			'x':-1,
			'y':-1
		}
		var petmp = {
			'x':-1,
			'y':-1
		}
		var rad = Math.PI / 4;
		context_bak.beginPath();
		context_bak.strokeStyle = '#00ff00';
		drawDashLine(context_bak, xStartList[numtmp] - gDsx, yStartList[numtmp] - gDsy, xEndList[numtmp] - gDsx, yEndList[numtmp] - gDsy, 2);
		context_bak.strokeStyle = choosedcolor;
		context_bak.beginPath();
		context_bak.moveTo(xStartList[numtmp] - gDsx - dvtmp ,yStartList[numtmp] - gDsy - dvtmp);	
		context_bak.lineTo(xStartList[numtmp] - gDsx + dvtmp, yStartList[numtmp] - gDsy - dvtmp);
		context_bak.lineTo(xStartList[numtmp] - gDsx + dvtmp, yStartList[numtmp] - gDsy + dvtmp);
		context_bak.lineTo(xStartList[numtmp] - gDsx - dvtmp, yStartList[numtmp] - gDsy + dvtmp);
		context_bak.lineTo(xStartList[numtmp] - gDsx - dvtmp, yStartList[numtmp] - gDsy - dvtmp);
		context_bak.moveTo(xEndList[numtmp] - gDsx - dvtmp ,yEndList[numtmp] - gDsy - dvtmp);	
		context_bak.lineTo(xEndList[numtmp] - gDsx + dvtmp, yEndList[numtmp] - gDsy - dvtmp);
		context_bak.lineTo(xEndList[numtmp] - gDsx + dvtmp, yEndList[numtmp] - gDsy + dvtmp);
		context_bak.lineTo(xEndList[numtmp] - gDsx - dvtmp, yEndList[numtmp] - gDsy + dvtmp);
		context_bak.lineTo(xEndList[numtmp] - gDsx - dvtmp, yEndList[numtmp] - gDsy - dvtmp);
		pstmp.x = xStartList[numtmp];
		pstmp.y = yStartList[numtmp];
		petmp.x = xEndList[numtmp];
		petmp.y = yEndList[numtmp];
		ptmp = RotatePoint(pstmp, petmp, rad, 'true');
		context_bak.moveTo(xStartList[numtmp] - gDsx,yStartList[numtmp] - gDsy);
		context_bak.lineTo(ptmp.x - gDsx,ptmp.y - gDsy);
		ptmp = RotatePoint(pstmp, petmp, rad, 'false');
		context_bak.lineTo(ptmp.x - gDsx,ptmp.y - gDsy);
		context_bak.lineTo(xStartList[numtmp] - gDsx,yStartList[numtmp] - gDsy);
		context_bak.stroke();
		context_bak.strokeStyle = color;
	}

	var mouseout = function(){
		if(graphType == 'connector'){
			canDraw = false;
			clearContext();
		}else if(graphType == 'cancel'){
			
		}
	}

	$(canvas_bak).unbind();
	$(canvas_bak).bind('mousedown',mousedown);
	$(canvas_bak).bind('mousemove',mousemove);
	$(canvas_bak).bind('mouseup',mouseup);
	$(canvas_bak).bind('mouseout',mouseout);
}

var drawconnector = function(type,psxtmp,psytmp,pextmp,peytmp){
	var ptmp = {
		'x':-1,
		'y':-1
	};
	var pstmp = {
		'x':-1,
		'y':-1
	}
	var petmp = {
		'x':-1,
		'y':-1
	}
	var rad = Math.PI / 4;
	clearContext();
	type.beginPath();
	type.strokeStyle = '#00ff00';
	drawDashLine(type, psxtmp, psytmp, pextmp, peytmp, 2);
	type.strokeStyle = color;
	pstmp.x = psxtmp;
	pstmp.y = psytmp;
	petmp.x = pextmp;
	petmp.y = peytmp;
	ptmp = RotatePoint(pstmp, petmp, rad, 'true');
	type.moveTo(psxtmp,psytmp);
	type.lineTo(ptmp.x,ptmp.y);
	ptmp = RotatePoint(pstmp, petmp, rad, 'false');
	type.lineTo(ptmp.x,ptmp.y);
	type.lineTo(psxtmp,psytmp);
	type.stroke();
}

function drawDashLine(type, x1, y1, x2, y2, dashLength){
	var dashLen = dashLength === undefined ? 5 : dashLength,
	xpos = x2 - x1, 
	ypos = y2 - y1,
	numDashes = Math.floor(Math.sqrt(xpos * xpos + ypos * ypos) / dashLen); 
	for(var i=0; i < numDashes; i++){
	 if(i % 2 === 0){
	     type.moveTo(x1 + (xpos/numDashes) * i, y1 + (ypos/numDashes) * i); 
	     
	  }else{
	      type.lineTo(x1 + (xpos/numDashes) * i, y1 + (ypos/numDashes) * i);
	  }
	}
	type.stroke();
}

function pointdistancefun(pstmp,petmp){
	return Math.sqrt(Math.pow(petmp.x - pstmp.x, 2) + Math.pow(petmp.y - pstmp.y, 2));
}

//两点和固定的点距离得出移点
function getotherpointfun(pstmp,petmp,distancetmp){
	var ktmp;
	var ptmp = {
		'x':-1,
		'y':-1
	}
	var pdxtmp = petmp.x-pstmp.x;
	var pdytmp = petmp.y-pstmp.y;
	if(pdxtmp != 0){
		ktmp = pdytmp / pdxtmp;
		var dktmp = Math.sqrt(distancetmp*distancetmp/(1+ktmp*ktmp));
		/*if(ktmp<0){
			dktmp = -dktmp;
		}
		if(pdxtmp >= 0){
			ptmp.x = pstmp.x + dktmp;
			ptmp.y = pstmp.y + ktmp*dktmp;
		}else if(pdxtmp < 0){
			ptmp.x = pstmp.x - dktmp;
			ptmp.y = pstmp.y - ktmp*dktmp;
		}*/
		if(ktmp > 0){
			if(pdytmp > 0){
				ptmp.x = pstmp.x + dktmp;
				ptmp.y = pstmp.y + ktmp*dktmp;
			}else if(pdytmp < 0){
				ptmp.x = pstmp.x - dktmp;
				ptmp.y = pstmp.y - ktmp*dktmp;
			}
		}else if(ktmp < 0){
			if(pdytmp > 0){
				ptmp.x = pstmp.x - dktmp;
				ptmp.y = pstmp.y - ktmp*dktmp;
			}else if(pdytmp < 0){
				ptmp.x = pstmp.x + dktmp;
				ptmp.y = pstmp.y + ktmp*dktmp;
			}
		}else{
			if(pdxtmp>0){
				ptmp.x = pstmp.x + distancetmp;
				ptmp.y = pstmp.y;
			}else{
				ptmp.x = pstmp.x - distancetmp;
				ptmp.y = pstmp.y;
			}
		}
	}else{
		ptmp.x = pstmp.x;
		if(pdytmp > 0){
			ptmp.y = pstmp.y + distancetmp;
		}else if(pdytmp < 0){
			ptmp.y = pstmp.y - distancetmp;
		}
	}
	return ptmp;
}

//点的弧度
function radPOX(x, y){
    //P在(0,0)的情况
    if (x == 0 && y == 0) return 0;

    //P在四个坐标轴上的情况：x正、x负、y正、y负
    if (y == 0 && x > 0) return 0;
    if (y == 0 && x < 0) return Math.PI;
    if (x == 0 && y > 0) return Math.PI / 2;
    if (x == 0 && y < 0) return Math.PI / 2 * 3;

    //点在第一、二、三、四象限时的情况
    if (x > 0 && y > 0) return Math.atan(y / x);
    if (x < 0 && y > 0) return Math.PI - Math.atan(y / -x);
    if (x < 0 && y < 0) return Math.PI + Math.atan(-y / -x);
    if (x > 0 && y < 0) return Math.PI * 2 - Math.atan(-y / x);
    return 0;
}

//旋转后的坐标
function RotatePoint(pstmp, petmp, rad, isClockwise){
    var ptmp = {
		'x':-1,
		'y':-1
	};
	ptmp.x = petmp.x - pstmp.x;
	ptmp.y = petmp.y - pstmp.y;
	var lengthtmp = pointdistancefun(pstmp,petmp);
	var angsePOX = radPOX(ptmp.x, ptmp.y);
	if(isClockwise == 'false'){
		rad = - rad;
	}
	var angdrsePOX = angsePOX - rad;
	ptmp.x = lengthtmp * Math.cos(angdrsePOX) + pstmp.x;
	ptmp.y = lengthtmp * Math.sin(angdrsePOX) + pstmp.y;
	return ptmp;
}

function redrawconnector(){
	clearContext('1');
	//var lengthtmp;
	//状态
	drawPicture(gPicture);
	var ptmp = {
		'x':-1,
		'y':-1
	};
	var pstmp = {
		'x':-1,
		'y':-1
	}
	var petmp = {
		'x':-1,
		'y':-1
	}
	var rad = Math.PI / 4;
	/*color = choosedcolor;
	for (var i = 0; i < xStartList.length; i++) {
		context.fillText(i,xStartList[i],yStartList[i]);
	}*/
	for(var i=0 ;i<xStartList.length;i++){
		drawconnector(context,xStartList[i] - gDsx,yStartList[i] - gDsy,xEndList[i] - gDsx,yEndList[i] - gDsy);
		/*context.beginPath();
		context.moveTo(xStartList[i],yStartList[i]);
		context.lineTo(xEndList[i],yEndList[i]);
		context.stroke();
		pstmp.x = xStartList[i];
		pstmp.y = yStartList[i];
		petmp.x = xEndList[i];
		petmp.y = yEndList[i];
		ptmp = RotatePoint(pstmp, petmp, rad, 'true');
		context.moveTo(xStartList[i],yStartList[i]);
		context.lineTo(ptmp.x,ptmp.y);
		context.stroke();
		ptmp = RotatePoint(pstmp, petmp, rad, 'false');
		context.moveTo(xStartList[i],yStartList[i]);
		context.lineTo(ptmp.x,ptmp.y);
		context.stroke();*/

		//lengthtmp = Math.sqrt(Math.pow(xEndList[i] - xStartList[i], 2) + Math.pow(yEndList[i] - yStartList[i], 2));

		//drawconnector('context',xStartList[i],yStartList[i],lengthtmp);

		/*context.beginPath();
		gConnectorLength = yEndList[i] - yStartList[i];
		context.moveTo(xStartList[i],yStartList[i]);
		context.lineTo(xEndList[i],yEndList[i]);
		context.lineTo(pxtmp + gConnectorLength, pytmp);
		context.lineTo(pxtmp + gConnectorLength, pytmp + gConnectorLength/3);
		context.lineTo(pxtmp + gConnectorLength/3, pytmp + gConnectorLength/3);
		context.lineTo(pxtmp + gConnectorLength/3, pytmp + gConnectorLength);
		context.lineTo(pxtmp, pytmp + gConnectorLength);
		context.lineTo(pxtmp, pytmp);
		context.stroke();
		context.moveTo(pxtmp + gConnectorLength/3, pytmp + gConnectorLength/3);
		context.lineTo(pxtmp + gConnectorLength, pytmp + gConnectorLength);	
		context.stroke();*/		
	}
	//color = "#000000";
	//context.strokeStyle = color;
}

//清空层
var clearContext = function(type){
	if(!type){
		context_bak.clearRect(0,0,canvasWidth,canvasHeight);
	}else{
		context.clearRect(0,0,canvasWidth,canvasHeight);
		context_bak.clearRect(0,0,canvasWidth,canvasHeight);
	}
}


function DevCurControlInfo(CurOpenShowtype){
	if(gCurOpenDevcode == -1){
		return;
	}
	var data = {'companyname':companyname,'username':username,'devicecode':gCurOpenDevcode,'devshowtype':CurOpenShowtype};
    var temp = JSON.stringify(data);
	$.ajax({
        url:('/dev/U/devcurcontrolinfo/'),
        type:'POST',
        data: {dat:temp},
        success:function(obj){
        	var txttmp='';
        	if(CurOpenShowtype == "ctrl"){
        		for(var i=0;i<obj.speedlevel.length;i++){
        			if(obj.speedlevel[i]==obj.curspeed){
        				txttmp=txttmp+'<option selected="selected">'+ obj.speedlevel[i] +'</option>';
        			}else{
        				txttmp=txttmp+'<option >' + obj.speedlevel[i] + '</option>';
        			}
        		}
        		document.getElementById("devspeedid").innerHTML=txttmp;
        		if(obj.userctrled == 'true'){
        			$("#operatecheckbox").attr("checked", true);
        		}else if(obj.userctrled == 'false'){
        			$("#operatecheckbox").attr("checked", false);
        		}
			}else if(CurOpenShowtype == "see"){
				document.getElementById("devspeedid").innerHTML=obj.curspeed;
				if(obj.userctrled == 'true'){
        			$("#devruntype").text('人工干预模式');
        		}else if(obj.userctrled == 'false'){
        			$("#devruntype").text('自动模式');
        		}
			}//工作的状态，按钮状态
			DevCurExeInfo(CurOpenShowtype);
        }
    });
}

//状态判断+显示
function DevCurExeInfo(CurOpenShowtype){
	if(gCurOpenDevcode == -1){
		return;
	}
	gDrawFlag=false;
	if(CurOpenShowtype == "ctrl"){
		if(gDevRunProgressCode[gCurOpenRownum] == gUserExeValue || gDevRunProgressCode[gCurOpenRownum]==0){
			$('#devspeedid').removeAttr('disabled');
			gDrawFlag=true;
			$('#drawbtnid').removeClass('disabled');
			$('#deldrawbtnid').removeClass('disabled');
			$('#devrunbtnid').removeClass('disabled');
			if(gCurOpenDevtype == gAppCanvasDevtype){
				draw_graph_line("cancel");
			}else if(gCurOpenDevtype == gAppScrewDevtype){
				draw_graph_connector("cancel");
			}
		}else{
			$('#devspeedid').attr('disabled','disabled');
			gDrawFlag=false;
			$('#drawbtnid').addClass('disabled');
			$('#deldrawbtnid').addClass('disabled');
			$('#devrunbtnid').addClass('disabled');
		}
	}
	if(gDevRunProgressCode[gCurOpenRownum]==0){
		gGetCalDataflag=false;
        Picturepathtmp = "http://192.168.1.114:8080/down/1.png";
        load(Picturepathtmp); 
	}else if(gDevRunProgressCode[gCurOpenRownum] != gUserExeValue && gDevRunProgressCode[gCurOpenRownum] != gExeRunValue){
		return;
	}
	var data = {'companyname':companyname,'username':username,'devicecode':gCurOpenDevcode};
    var temp = JSON.stringify(data);
	$.ajax({
        url:('/dev/U/devcurexeinfo/'),
        type:'POST',
        data: {dat:temp},
        success:function(obj){
        	xStartList=[];
            yStartList=[];
            xEndList=[];
            yEndList=[];
            for (var i = 0; i < obj.caldata.LineList.length; i++) {
                xStartList.push(obj.caldata.LineList[i].x0);
                yStartList.push(obj.caldata.LineList[i].y0);
                xEndList.push(obj.caldata.LineList[i].x1);
                yEndList.push(obj.caldata.LineList[i].y1);
            }        	
			if(gDevRunProgressCode[gCurOpenRownum] == gUserExeValue || gDevRunProgressCode[gCurOpenRownum] == gExeRunValue){
				if(gCurOpenDevtype == gAppCanvasDevtype){
	                for (i = 0; i < xStartList.length; i++) {
	                    xStartList[i]=xStartList[i]/gPicScale + gDsx;
	                    yStartList[i]=yStartList[i]/gPicScale + gDsy;
	                    xEndList[i]=xEndList[i]/gPicScale + gDsx;
	                    yEndList[i]=yEndList[i]/gPicScale + gDsy;
	                }
	                if(gDevRunProgressCode[gCurOpenRownum]==gUserExeValue){
	                    gGetCalDataflag=false;
	                    redrawline();
	                }else{
	                    gGetCalDataflag=true;
	                    DrawLinePath();
	                    DrawLineCurPath(gDevProcessDsc[gCurOpenRownum],false);
	                }
	            }else if(gCurOpenDevtype == gAppScrewDevtype){
	                for (i = 0; i < xStartList.length; i++) {
	                    xStartList[i]=xStartList[i]/gPicScale + gDsx;
	                    yStartList[i]=yStartList[i]/gPicScale + gDsy;
	                    xEndList[i]=((xEndList[i]-xStartList[i])*gConnectorLength+xStartList[i])/gPicScale + gDsx;
	                    yEndList[i]=((yEndList[i]-yStartList[i])*gConnectorLength+yStartList[i])/gPicScale + gDsy;
	                }
	                if(gDevRunProgressCode[gCurOpenRownum]==gUserExeValue){
	                    gGetCalDataflag=false;
	                    redrawconnector();
	                }else{
	                    gGetCalDataflag=true;
	                    DrawConnectorPath();
	                     DrawConnectorCurPath(gDevProcessDsc[gCurOpenRownum],false);
	                }
	                
	            }
			}
        }
    });
}

//路径显示
function DrawLinePath(){
	context.strokeStyle = choosedcolor;
	redrawline();
	context.strokeStyle = color;
	for (var i = 0; i < xStartList.length; i++) {
		context.fillText(i,xStartList[i],yStartList[i]);
	}
}
//路径显示
function DrawConnectorPath(){
	color = choosedcolor;
	redrawconnector();
	color = "#000000";
	context.strokeStyle = color;
	for (var i = 0; i < xStartList.length; i++) {
		context.fillText(i+1,xStartList[i],yStartList[i]);
	}
}
//Line动态路径显示
function DrawLineCurPath(pathno,drew){
	var i;
	if(pathno<0 || pathno>xStartList.length){
		window.alert('应用人员所给的路径索引有误！');
	}
	context.strokeStyle = '#00ff00';
	if(drew){
		context.beginPath();
		context.moveTo(xStartList[pathno] - gDsx,yStartList[pathno] - gDsy);
		context.lineTo(xEndList[pathno] - gDsx,yEndList[pathno] - gDsy);	
		context.stroke();
	}else{
		for(i=0 ;i<=pathno;i++){
			context.beginPath();
			context.moveTo(xStartList[i] - gDsx,yStartList[i] - gDsy);
			context.lineTo(xEndList[i] - gDsx,yEndList[i] - gDsy);	
			context.stroke();		
		}
	}
	context.strokeStyle = color;
}
//Connector动态路径显示
function DrawConnectorCurPath(pathno,drew){
	var i;
	if(pathno<0 || pathno>xStartList.length){
		window.alert('应用人员所给的路径索引有误！');
	}
	color = '#00ff00';
	if(drew){
		drawconnector(context,xStartList[pathno] - gDsx,yStartList[pathno] - gDsy,xEndList[pathno] - gDsx,yEndList[pathno] - gDsy);
	}else{
		for(i=0 ;i<=pathno;i++){
			drawconnector(context,xStartList[i] - gDsx,yStartList[i] - gDsy,xEndList[i] - gDsx,yEndList[i] - gDsy);		
		}
	}
	color = "#000000";
	context.strokeStyle = color;
}

function appdevrunbtnfun(type){
	if(gCurOpenDevcode == -1){
		return;
	}
	if(!gDrawFlag){
    	return;
    }
	appdevpathdatafun(type);
	var data = {'companyname':companyname,'username':username,'devicecode':gCurOpenDevcode,'devrun':'true'};
    var temp = JSON.stringify(data);
	$.ajax({
        url:('/dev/U/usercontroldevrun/'),
        type:'POST',
        data: {dat:temp},
        success:function(obj){
            $('#myModaltitleLabel').text('运行设备');
            document.getElementById("myModelBodyDiv").innerHTML=obj.discb;
            document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" data-dismiss="modal" onclick="clearmodelcssfun();">关闭</button>';
            document.getElementById("buttonmodel").click();
            if(obj.discbcss=="suc"){
            	$('#myModelBodyDiv').addClass("suc");
            	$('#myModelBodyDiv').removeClass("fail");
            }else if(obj.discbcss=="fail"){
            	$('#myModelBodyDiv').removeClass("suc");
            	$('#myModelBodyDiv').addClass("fail");
            }
        }
    });
}


function appdevpathdatafun(type){
	if(gCurOpenDevcode == -1){
		return;
	}
	if(xStartList.length<=0){
		return;
	}
	var x0tmp = new Array();
	var y0tmp = new Array();
	var x1tmp = new Array();
	var y1tmp = new Array();
	if(type == gAppCanvasDevtype){
		for (var i = 0; i < xStartList.length; i++) {
			x0tmp.push((xStartList[i]- gDsx)*gPicScale);
			y0tmp.push((yStartList[i]-gDsy)*gPicScale);
			x1tmp.push((xEndList[i]-gDsx)*gPicScale);
			y1tmp.push((yEndList[i]-gDsy)*gPicScale);
		}
	}else if(type == gAppScrewDevtype){
		for (var i = 0; i < xStartList.length; i++) {
			x0tmp.push((xStartList[i]- gDsx)*gPicScale);
			y0tmp.push((yStartList[i]-gDsy)*gPicScale);
			x1tmp.push(((xEndList[i]-xStartList[i])/gConnectorLength+(xStartList[i]- gDsx))*gPicScale);
			y1tmp.push(((yEndList[i]-yStartList[i])/gConnectorLength+(yStartList[i]-gDsy))*gPicScale);
		}
	}
	var LineList = {
		'x0':x0tmp,
		'y0':y0tmp,
		'x1':x1tmp,
		'y1':y1tmp
	}
	var data = {'companyname':companyname,'username':username,'devicecode':gCurOpenDevcode,'devpathdata':LineList};
    var temp = JSON.stringify(data);
	$.ajax({
        url:('/dev/U/usercontroldevpathdata/'),
        type:'POST',
        data: {dat:temp},
        success:function(obj){
            /*$('#myModaltitleLabel').text('数据');
            document.getElementById("myModelBodyDiv").innerHTML=obj.discb;
            document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
            document.getElementById("buttonmodel").click();
            if(obj.discbcss=="suc"){
            	$('#myModelBodyDiv').removeClass("suc");
            }else*/ 
            if(obj.discbcss=="fail"){
            	$('#myModaltitleLabel').text('数据');
	            document.getElementById("myModelBodyDiv").innerHTML=obj.discb;
	            document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" data-dismiss="modal" onclick="clearmodelcssfun();">关闭</button>';
	            document.getElementById("buttonmodel").click();
            	$('#myModelBodyDiv').addClass("fail");
            }
        }
    });
}

function appdevstoprunbtnfun(){
	if(gCurOpenDevcode == -1){
		return;
	}
	var data = {'companyname':companyname,'username':username,'devicecode':gCurOpenDevcode,'devstoprun':'true'};
    var temp = JSON.stringify(data);
	$.ajax({
        url:('/dev/U/usercontroldevstoprun/'),
        type:'POST',
        data: {dat:temp},
        success:function(obj){
            $('#myModaltitleLabel').text('停止运行设备');
            document.getElementById("myModelBodyDiv").innerHTML=obj.discb;
            document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" data-dismiss="modal" onclick="clearmodelcssfun();">关闭</button>';
            document.getElementById("buttonmodel").click();
            if(obj.discbcss=="suc"){
            	$('#myModelBodyDiv').addClass("suc");
            	$('#myModelBodyDiv').removeClass("fail");
            }else if(obj.discbcss=="fail"){
            	$('#myModelBodyDiv').removeClass("suc");
            	$('#myModelBodyDiv').addClass("fail");
            }
        }
    });
}

function appusercontroldevbtnfun(){
	if(gCurOpenDevcode == -1){
		return;
	}
	var controltmp = "false";
    if ($("#operatecheckbox").attr("checked")){
        $("#operatecheckbox").removeAttr("checked");
        controltmp = "false";
    }
    else{
        $("#operatecheckbox").attr("checked",'true');
        controltmp = "true";
    }
	var data = {'companyname':companyname,'username':username,'devicecode':gCurOpenDevcode,'usercontrol':controltmp};
    var temp = JSON.stringify(data);
	$.ajax({
        url:('/dev/U/usercontroldevrequest/'),
        type:'POST',
        data: {dat:temp},
        success:function(obj){
            $('#myModaltitleLabel').text('用户干预模式');
            document.getElementById("myModelBodyDiv").innerHTML=obj.discb;
            document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" data-dismiss="modal" onclick="clearmodelcssfun();">关闭</button>';
            document.getElementById("buttonmodel").click();
            if(obj.discbcss=="suc"){
            	$('#myModelBodyDiv').addClass("suc");
            	$('#myModelBodyDiv').removeClass("fail");
            }else if(obj.discbcss=="fail"){
            	$('#myModelBodyDiv').removeClass("suc");
            	$('#myModelBodyDiv').addClass("fail");
            }
        }
    });
}

function appdevspeedbtnfun(){
	if(gCurOpenDevcode == -1){
		return;
	}
	var speedtmp;
	var selecttmp=document.getElementById("devspeedid");
	var index=selecttmp.selectedIndex ; 
	speedtmp = selecttmp.options[index].text;
	console.log(speedtmp);
	var data = {'companyname':companyname,'username':username,'devicecode':gCurOpenDevcode,'devspeed':speedtmp};
    var temp = JSON.stringify(data);
	$.ajax({
        url:('/dev/U/usercontroldevspeed/'),
        type:'POST',
        data: {dat:temp},
        success:function(obj){
            $('#myModaltitleLabel').text('设备运行速度');
            document.getElementById("myModelBodyDiv").innerHTML=obj.discb;
            document.getElementById("myModalFooter").innerHTML='<button type="button" class="btn btn-default" data-dismiss="modal" onclick="clearmodelcssfun();">关闭</button>';
            document.getElementById("buttonmodel").click();
            if(obj.discbcss=="suc"){
            	$('#myModelBodyDiv').addClass("suc");
            	$('#myModelBodyDiv').removeClass("fail");
            }else if(obj.discbcss=="fail"){
            	$('#myModelBodyDiv').removeClass("suc");
            	$('#myModelBodyDiv').addClass("fail");
            }
        }
    });
}