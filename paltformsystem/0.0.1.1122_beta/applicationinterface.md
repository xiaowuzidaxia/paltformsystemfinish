#应用人员接口说明#
支持lua语法

----------
##整体相关##

**lua_func_Sleep(millisecond)**
休眠一段时间，
第一个参数：毫秒值

**lua_registerEvent(Signal，callbackFunction)**
讲某个指令码注册为回调事件，系统收到信号后会执行callbackFunction函数中的内容，开发人员需要自己定义callbackFunction函数。
第一个参数：事件描述字符串
电系统部分为相应命令编码，参看相关文档
服务器部分可通过lua_getPermittedSign()函数查询相关可注册事件。
第二个参数：回调函数形式callbackFunction(string1,string2)
string1为该事件的信号码，string2为该事件附带的数据
返回值：如果成功返回0和描述，失败返回nil和描述
>例如：
>lua_registerEvent("M41",M41back)
>注册了M41事件，当电系统发送M41的数据过来时，触发M41back函数的调用。该函数注册的事件不会主动向其他模块发送数据。此功能请参看
lua_registerLoopEvent()函数

**lua_registerLoopEvent(Signal，timer，callbackFunction)**
函数功能与lua_registerEvent相似，只是该函数会每隔timer时间向相应模块发送查询指令。
第二个参数：发起定时查询的时间间隔 单位是：ms

**lua_closeEvent(Signal)**
关闭事件，被关闭的事件不在会被触发
第一个参数：事件描述字符串

**lua_loadfile(filename)**
导入lua脚本。
第一个参数：lua脚本文件名


##电系统相关##
**lua_func_openNetWork(srcaddr,dstaddr,IpPort)**
配置电系统连接参数
第一个参数：自身协议地址
第二个参数：电系统协议地址
第三个参数：电系统Ip地址和端口用“：”隔开
返回：如果配置成功，返回0和相应描述。如果失败返回nil和描述
>例如：
>lua_func_openNetWork(0x10,0xc0,"127.0.0.1:6000")

**lua_getD(Signal,waitFlagNum,1)**
从电系统获取数据。
第一个参数：设备指令码
第二个参：是否等待结果，如果设置为0，该指令给设备发生指令后直接返回：如果设置为1，该指令会等到设备返回结果才返回。
第三个参数：0串行指令，1并行指令。该参数可不填，默认为0串行指令。
>例如:
>lua_getD("M41",1,1)
>该函数会向电系统发送M41的查询指令，并且等到电系统返回结果才返回

**lua_setD(Signal,data，waitFlagNum,1)**
给设备写入数据。然后查询设备是否写入成功。
第一个参数   设备指令码
第二个参数   给设备发送的数据，目前只支持数值发送。
第三个参数   是否等待结果，如果设置为0，该指令给设备发生指令后直接返回。如果设置为1，该指令会等到设备返回结果。
第四个参数   0串行指令，1并行指令。该参数可不填，默认为0串行指令。
注意：这是一条存在风险的指令，如果在需要等待返回的模式下设置了不存在的指令，那么很遗憾，这条指令将永远不会退出。
>例如:
>lua_setD("M41"，11,1,1)
>该函数会向电系统发送M41的查询指令，并且等到电系统返回M41的结果才返回

##服务器相关##

**lua_initWebLink()**
初始化服务器，该函数会初始化与算法服务以及数据服务器，在调用服务器相关的操作前必须调用此函数

返回：如果调用初始化失败，返回nil和描述。如果调用成功，返回0和描述

**lua_getPermittedSign()**
返回服务器相关的课允许信号。

返回：返回一个包含描述的table

**lua_SearchDateBase(Name)**
在数据服务器查询相应数据。

第一个参数：要查询数据的名称。目前只支持部分数据。可允许的数据，可用lua_getPermittedSign()查询。

返回：查询结果

**lua_setScheduleDescribe(ScheduleDsc)**
上传当前进度描述。

第一个参数: json格式的进度描述。
返回：失败返回nil，成功返回结果

>例如
>lua_setScheduleDescribe("{\"index\": \"1\"}")
>描述内容由脚本应用编写人员和网页应用人员协商

**lua_postReslutToDataServer(filename)**
提交保存算法结果的文件到数据服务器

第一个参数：文件名
返回：失败返回no，成功操作结果返回结果yes

**lua_setSchedule(ScheduleCode)**
设置当前进度
第一个参数：数字字符串
返回：失败返回nil，成功返回结果

**lua_postPictureTotAlgorithmServer(filename，Format，PosInfo)**
获取的图片提交给算法服务器
第一个参数：图片文件地址
第二个参数：图片格式，目前只支持jpg
第三个参数：图片所在平面位置
>格式
>PosInfo定义JSON格式为：{‘px’:’##’,’py’:’##’}’

返回：提供算法访问的图片地址


**lua_requestAlgorithm(AlgID,Paras)**
获取算法结果。
第一个参数：算法类型
>支持类型
>ImgStitch1611:图片拼接算法
>FindCorner1611：查找矩形角落算法
>FindLine1611：查找直线算法

第二个参数：图片所在的服务器地址

返回：算法计算结果，字符串，格式暂定


**lua_getPicture(Type，path)**
获取图片
第一个参数：图片获取方式，目前没有可用方式
第二个参数：图片地址，目前不可用
返回：不可用


**lua_hangup(Signal)**
让当前线程挂起，直到收到结束信号
第一个参数：设定信号函数返回信号


**lua_triggerSignal(Signal)**
人工触发某个信号
第一个参数：信号名称


