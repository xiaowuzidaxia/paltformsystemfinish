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

var xStartList = new Array();
var yStartList = new Array();
var xEndList = new Array();
var yEndList = new Array();
var newdrawclick = true;

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

//进入控制面板的初始化
function appCommonInit(CurOpenDevtype, CurOpenShowtype){
	if(CurOpenDevtype == "CutCanvas"){
		newdrawclick = true;
		xStartList=[];
		yStartList=[];
		xEndList=[];
		yEndList=[];
		initCanvas();
	}else if(CurOpenDevtype == "TwistScrew"){
		newdrawclick = true;
		xStartList=[];
		yStartList=[];
		xEndList=[];
		yEndList=[];
		initCanvas();
	}
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
} 

//选择画割线
function drawlineclickfun(){
	if(newdrawclick){
		$("#drawlinebtnid").addClass('clickedappbtn');
		document.getElementById("canvas_bak").style.cursor="crosshair"; 
		draw_graph_line("line");
		newdrawclick = false;
	}else{
		$("#drawlinebtnid").removeClass('clickedappbtn');
		document.getElementById("canvas_bak").style.cursor="default"; 
		draw_graph_line("cancel")
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
	context_bak.strokeStyle = color;
	context_bak.lineWidth = size;
	canvasTop = Number($(canvas).offset().top) - Number($(window).scrollTop());
    canvasLeft = Number($(canvas).offset().left) - Number($(window).scrollLeft());

	var mousedown = function(e){
		canvasTop = Number($(canvas).offset().top) - Number($(window).scrollTop());
		canvasLeft = Number($(canvas).offset().left) - Number($(window).scrollLeft());
		e = e||window.event;
		startX = e.clientX - canvasLeft;
		startY = e.clientY - canvasTop;		
		if(graphType == 'line'){
			context_bak.beginPath();
			context_bak.moveTo(startX ,startY);	
			canDraw = true;
		}else if(graphType == 'cancel'){
			downchoosed = ongraphfun('line',startX ,startY,4);
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
		if(graphType == 'line'){
			/*var image = new Image();	
			image.src = canvas_bak.toDataURL();
			image.onload = function(){
				context.drawImage(image , 0 ,0 , image.width , image.height , 0 ,0 , parseInt(canvasWidth) , parseInt(canvasHeight));
				clearContext();
			}*/
			context.beginPath();
			context.moveTo(startX ,startY);	
			context.lineTo(endX,endY);
			context.stroke();
			xStartList.push(startX);
			yStartList.push(startY);
			xEndList.push(endX);
			yEndList.push(endY);
		}else if(graphType == 'cancel'){
			clearContext();
			movechoosed = ongraphfun('line',endX,endY,4);
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
				clearContext();
				context_bak.beginPath();
				context_bak.moveTo(startX, startY);
				context_bak.lineTo(endX, endY);
				context_bak.stroke();
			}	
		}else if(graphType == 'cancel'){
			if(canDraw == false){
				movechoosed = ongraphfun('line',endX,endY,4);
			}else{
				if((movechoosed.choosednum  != downchoosed.choosednum) && (canDrawPoint == false)){
					movechoosed = ongraphfun('line',endX,endY,4);
				}
			}
			if(movechoosed.choosedstate == 'none'){
				document.getElementById("canvas_bak").style.cursor="auto"; 
			}
			else{
				var numtmp = movechoosed.choosednum;
				if(movechoosed.choosedstate == 'line'){
					document.getElementById("canvas_bak").style.cursor="move"; 
					if(canDraw && (movechoosed.choosednum == downchoosed.choosednum)){
						var dxtmp = endX - startX;
						var dytmp = endY - startY;
						xStartList[numtmp] = downchoosed.pointx + dxtmp;
						yStartList[numtmp] = downchoosed.pointy + dytmp;
						xEndList[numtmp] = downchoosed.pointex + dxtmp;
						yEndList[numtmp] = downchoosed.pointey + dytmp;
						redrawline();
						drawrectangle(numtmp);
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
								xEndList[numtmp] = endX;
								yEndList[numtmp] = endY;
							}else if(movechoosed.pointex == xEndList[numtmp] && movechoosed.pointey == yEndList[numtmp]){
								xStartList[numtmp] = endX;
								yStartList[numtmp] = endY;
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
		context_bak.beginPath();
		context_bak.moveTo(xStartList[numtmp] - dvtmp ,yStartList[numtmp] - dvtmp);	
		context_bak.lineTo(xStartList[numtmp] + dvtmp, yStartList[numtmp] - dvtmp);
		context_bak.lineTo(xStartList[numtmp] + dvtmp, yStartList[numtmp] + dvtmp);
		context_bak.lineTo(xStartList[numtmp] - dvtmp, yStartList[numtmp] + dvtmp);
		context_bak.lineTo(xStartList[numtmp] - dvtmp, yStartList[numtmp] - dvtmp);
		context_bak.moveTo(xEndList[numtmp] - dvtmp ,yEndList[numtmp] - dvtmp);	
		context_bak.lineTo(xEndList[numtmp] + dvtmp, yEndList[numtmp] - dvtmp);
		context_bak.lineTo(xEndList[numtmp] + dvtmp, yEndList[numtmp] + dvtmp);
		context_bak.lineTo(xEndList[numtmp] - dvtmp, yEndList[numtmp] + dvtmp);
		context_bak.lineTo(xEndList[numtmp] - dvtmp, yEndList[numtmp] - dvtmp);
		context_bak.stroke();
	}

	var mouseout = function(){
		if(graphType == 'line'){
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
	}
}

function redrawline(){
	clearContext('1');
	for(var i=0 ;i<xStartList.length;i++){
		context.beginPath();
		context.moveTo(xStartList[i],yStartList[i]);
		context.lineTo(xEndList[i],yEndList[i]);	
		context.stroke();		
	}
}

function drawconnectorclickfun(){
	if(newdrawclick){
		$("#drawconnectorbtnid").addClass('clickedappbtn');
		document.getElementById("canvas_bak").style.cursor="crosshair"; 
		draw_graph_connector("connector");
		newdrawclick = false;
	}else{
		$("#drawconnectorbtnid").removeClass('clickedappbtn');
		document.getElementById("canvas_bak").style.cursor="auto"; 
		draw_graph_connector("cancel")
		newdrawclick = true;
	}
}


function draw_graph_connector(graphType){
	var canDraw = false;
	var canDrawPoint = false;
	var startX;
	var startY;
	var endX;
	var endY;
	var connectorlength = 30;
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

	var mousedown = function(e){
		canvasTop = Number($(canvas).offset().top) - Number($(window).scrollTop());
		canvasLeft = Number($(canvas).offset().left) - Number($(window).scrollLeft());
		e = e||window.event;
		startX = e.clientX - canvasLeft;
		startY = e.clientY - canvasTop;		
		if(graphType == 'connector'){
			//drawconnector('context_bak',startX,startY,startX+connectorlength,startY+connectorlength);
			canDraw = true;
		}else if(graphType == 'cancel'){
			downchoosed = ongraphfun('connector',startX ,startY,4);
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
				petmp = getotherpointfun(pstmp,petmp,connectorlength);
				if(petmp.x<0 || petmp.y<0){
					redrawconnector();
					drawrectangle(numtmp);
					return;
				}
				endX = petmp.x;
				endY = petmp.y;
				canDrawPoint = false;
				xStartList.push(startX);
				yStartList.push(startY);
				xEndList.push(endX);
				yEndList.push(endY);
			}
			
		}else if(graphType == 'cancel'){
			canDrawPoint = false;
			clearContext();
			movechoosed = ongraphfun('connector',endX,endY,4);
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
				petmp = getotherpointfun(pstmp,petmp,connectorlength);
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
				movechoosed = ongraphfun('connector',endX,endY,4);
			}else{
				if((movechoosed.choosednum  != downchoosed.choosednum) && (canDrawPoint == false)){
					movechoosed = ongraphfun('connector',endX,endY,4);
				}
			}
			if(movechoosed.choosedstate == 'none'){
				document.getElementById("canvas_bak").style.cursor="auto"; 
			}
			else{
				var numtmp = movechoosed.choosednum;
				if(movechoosed.choosedstate == 'connector'){
					document.getElementById("canvas_bak").style.cursor="move"; 
					if(canDraw && (movechoosed.choosednum == downchoosed.choosednum)){
						var dxtmp = endX - startX;
						var dytmp = endY - startY;
						xStartList[numtmp] = downchoosed.pointx + dxtmp;
						yStartList[numtmp] = downchoosed.pointy + dytmp;
						xEndList[numtmp] = downchoosed.pointex + dxtmp;
						yEndList[numtmp] = downchoosed.pointey + dytmp;
						redrawconnector();
						drawrectangle(numtmp);
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
								'x':endX,
								'y':endY
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
		context_bak.beginPath();
		context_bak.moveTo(xStartList[numtmp] - dvtmp ,yStartList[numtmp] - dvtmp);	
		context_bak.lineTo(xStartList[numtmp] + dvtmp, yStartList[numtmp] - dvtmp);
		context_bak.lineTo(xStartList[numtmp] + dvtmp, yStartList[numtmp] + dvtmp);
		context_bak.lineTo(xStartList[numtmp] - dvtmp, yStartList[numtmp] + dvtmp);
		context_bak.lineTo(xStartList[numtmp] - dvtmp, yStartList[numtmp] - dvtmp);
		context_bak.moveTo(xEndList[numtmp] - dvtmp ,yEndList[numtmp] - dvtmp);	
		context_bak.lineTo(xEndList[numtmp] + dvtmp, yEndList[numtmp] - dvtmp);
		context_bak.lineTo(xEndList[numtmp] + dvtmp, yEndList[numtmp] + dvtmp);
		context_bak.lineTo(xEndList[numtmp] - dvtmp, yEndList[numtmp] + dvtmp);
		context_bak.lineTo(xEndList[numtmp] - dvtmp, yEndList[numtmp] - dvtmp);
		context_bak.stroke();
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
	for(var i=0 ;i<xStartList.length;i++){
		drawconnector(context,xStartList[i],yStartList[i],xEndList[i],yEndList[i]);
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
		connectorlength = yEndList[i] - yStartList[i];
		context.moveTo(xStartList[i],yStartList[i]);
		context.lineTo(xEndList[i],yEndList[i]);
		context.lineTo(pxtmp + connectorlength, pytmp);
		context.lineTo(pxtmp + connectorlength, pytmp + connectorlength/3);
		context.lineTo(pxtmp + connectorlength/3, pytmp + connectorlength/3);
		context.lineTo(pxtmp + connectorlength/3, pytmp + connectorlength);
		context.lineTo(pxtmp, pytmp + connectorlength);
		context.lineTo(pxtmp, pytmp);
		context.stroke();
		context.moveTo(pxtmp + connectorlength/3, pytmp + connectorlength/3);
		context.lineTo(pxtmp + connectorlength, pytmp + connectorlength);	
		context.stroke();*/		
	}
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