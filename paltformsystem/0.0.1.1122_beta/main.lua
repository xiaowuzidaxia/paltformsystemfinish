--cjson = require "cjson"    -- 加载C库。




getPicturePlace= {[1]={px=0 ,py =0},[2]={px=600 ,py =500},[3]={px=600 ,py =1000},[4]={px=1200 ,py =500},[5]={px=1200 ,py =1000}}

			 
PicturePath= {[1]="./pic/e.jpg",
             [2]="./pic/1.jpg",
             [3]="./pic/2.jpg",
             [4]="./pic/3.jpg",
             [5]="./pic/4.jpg",
             }		 
	
ePath = "image/20161109-041342-7117486.jpg"
function PrintTable( tbl , level, filteDefault)
  local msg = ""
  filteDefault = filteDefault or true --默认过滤关键字（DeleteMe, _class_type）
  level = level or 1
  local indent_str = ""
  for i = 1, level do
    indent_str = indent_str.."  "
  end

  print(indent_str .. "{")
  for k,v in pairs(tbl) do
    if filteDefault then
      if k ~= "_class_type" and k ~= "DeleteMe" then
        local item_str = string.format("%s%s = %s", indent_str .. " ",tostring(k), tostring(v))
        print(item_str)
        if type(v) == "table" then
          PrintTable(v, level + 1)
        end
      end
    else
      local item_str = string.format("%s%s = %s", indent_str .. " ",tostring(k), tostring(v))
      print(item_str)
      if type(v) == "table" then
        PrintTable(v, level + 1)
      end
    end
  end
  print(indent_str .. "}")
end

function waituser()
	UIStart = lua_SearchDateBase("UIIntervene")
	if(UIStart == "yes")
	then
		print(lua_setSchedule("14"))--用户操作
		UIFinishFLag = "no"
		while(UIFinishFLag == "no")
		do
			UIFinishFLag = lua_SearchDateBase("UIFinishFLag")
			lua_func_Sleep(1000)--延时1000毫秒
		end  
			
	else
      
	end
end

function mprocess()
	Dspeed = lua_SearchDateBase("UISpeed")--获取速度
	--lua_setD("速度",Dspeed,"NoWait","SERIAL")

	lua_setSchedule("12")--设置设备进度，定义在配置文件或数据服务器的表中采集
	AlgorithmAddr = lua_SearchDateBase("AlgorithmAddr")--获取算法服务器地址	
	local tempTath = ePath	

	for i=2, #(PicturePath) 
	do 
		local jsont = cjson.encode(getPicturePlace[i])
		print (jsont)
		Wpath = lua_postPictureTotAlgorithmServer(PicturePath[i],"jpg",jsont)
		print (Wpath)

		local tab = cjson.decode(Wpath)

		jssrt = string.format("{\"ImgURL1\":\"%s\",\"ImgURL2\":\"%s\"}", tempTath,tab["ImgURL"])
		print(jssrt)

		str = lua_requestAlgorithm("ImgStitch1611",jssrt)
		print(str)

		local rTab = cjson.decode(str)

		temTable =rTab["RetData"]
		tempTath = temTable["ImgURL"]

		--allAlgorithmAddr = string.format("%s%s", AlgorithmAddr,tempTath)
		allAlgorithmAddr = tempTath
	
		lua_func_Sleep(1000)--延时100毫秒
		print(lua_postPictureToDataServer(allAlgorithmAddr))   

	end 
	
	local jssrt = string.format("{\"ImgURL\":\"%s\"}", tempTath)
	print (jssrt)
	local str = lua_requestAlgorithm("FindCorner1611",jssrt)
	print (str) 
	Retdata = cjson.decode(str)
	local LineList = Retdata["RetData"]
	LineList = LineList["List"]
	str = cjson.encode(LineList)
	PrintTable (LineList) 


	lua_postPictureToDataServer(allAlgorithmAddr)  
	
	str = string.format("{\"List\":%s}",str)
	
	lua_postReslutToDataServer(str)   
	print(lua_setSchedule("13"))--识别完成

	waituser()

	
	reslutJson = lua_SearchDateBase("UIResult")

	lua_setSchedule("15")--设置进度    运行
	print(reslutJson)
	if(reslutJson == "")
	then
		print("reslutJson error")
	end
	local Retdata = cjson.decode(reslutJson)
	PrintTable(Retdata["List"])
	local LineList = Retdata["List"]
	--处理算法结果
	local ListLen = #(LineList)
	for i=1, #(LineList) 
	do  
		local spoint = string.format("move (%s,%s)",LineList[i].x1,LineList[i].y1)
		print(spoint)
		local pJson = string.format("{\"index\":\"%s\",\"length\":\"%d\"}", i,ListLen)
		print(lua_setScheduleDescribe(pJson)) 
		lua_func_Sleep(2000)--延时100毫秒
	end 

	--lua_triggerSignal("end")  
	
	
	lua_func_Sleep(2000)--延时100毫秒
	print(lua_setSchedule("11"))--设置进度    运行
	local pJson = string.format("{\"index\":\"%s\"}",0)
	print(lua_setScheduleDescribe(pJson)) 
	print "end one process"
	print ""
end
	
function beginCallback(a,b)
	if(b == "1"or b == "yes")--触发设备按钮或者UI按键
	then
		--开始运行，然后关闭开始事件，避免再次触发	
		print("***************************************begin***********************************")
		mprocess()
		print("****************************************end************************************")
	else
	--继续等
	end                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
end

function endCallback(a,b)
	if(b == "1"or b == "yes")--触发设备按钮或者UI按键
	then
		
		lua_closeEvent("K1")
		lua_closeEvent("UIStart") 
		--lua_closeEvent("UIEnd") 
		lua_triggerSignal("end")
	else
	--继续等
	end               
	
end



lua_initWebLink()
lua_setSchedule("11")--设置进度 空闲
lua_registerLoopEvent("UIStart",500,beginCallback)
lua_registerLoopEvent("K2",500,beginCallback)--开始按键触发事件
--lua_registerLoopEvent("UIEnd",500,endCallback)


lua_hangup("end")