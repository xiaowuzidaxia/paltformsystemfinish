package controllers

import (
	"encoding/json"
	"fmt"
	"github.com/astaxie/beego"
	//"github.com/astaxie/beego/cache"
	_ "github.com/astaxie/beego/cache/redis"
	"github.com/astaxie/beego/orm"
	"github.com/garyburd/redigo/redis"
	"io/ioutil"
	"strconv"
	//"github.com/garyburd/redigo/redis"
)

//全局redis连接池对象
var (
	RedisClient *redis.Pool
	REDIS_HOST  string
	REDIS_PORT  string
)

type SoftLogin struct {
	beego.Controller
}

func (c *SoftLogin) Post() {
	username := c.GetString("username", "1")
	password := c.GetString("password", "1")
	companyname := c.GetString("companyname", "1")

	//判断获取值是否为空,三个值为空立马
	if k := UtilCheck("1", username, password, companyname); k == false {
		c.Ctx.WriteString("非空检查failed")
		return
	}

	//计算username,passowrd,companyname的md5值
	hresult := GetMD5(username+password, password, companyname)
	fmt.Println("-----------md5 result ======", hresult)

	/*if rs == nil {
	        rs, _ = cache.NewCache("redis", `{"conn":"127.0.0.1:6379", "key":"beecacheRedis"}`)
	}*/

	var final bool
	var operate bool
	//先判断缓存中是否有这三个值的缓存
	/*res1, err1 := GetCache(hresult)

	  if err1 == true {
	          c.SetSession("softlogin", true)
	          if res1 == "final" {
	                  fmt.Println("softlogin session=====:", c.GetSession("softlogin"))
	                  c.Ctx.WriteString("final")
	          } else if res1 == "operate" {
	                  c.Ctx.WriteString("operate")
	          }
	          return

	  } else {
	          final = FirstCheck(username, password, companyname, "FinalUserInfo")
	          operate = FirstCheck(username, password, companyname, "OperateUserInfo")
	          fmt.Println("final-----operate-----:", final, operate)
	  }*/
	final = FirstCheck(username, password, companyname, "FinalUserInfo")
	operate = FirstCheck(username, password, companyname, "OperateUserInfo")
	fmt.Println("final-----operate-----:", final, operate)
	if final == true && operate == false {
		c.SetSession("softlogin", true)
		SetCache(hresult, "final")
		c.Ctx.WriteString("final")
	} else if final == false && operate == true {
		c.SetSession("softlogin", true)
		SetCache(hresult, "operate")
		c.Ctx.WriteString("operate")
	} else {
		c.Ctx.WriteString("Faillogin")
	}
}

type GetVersion struct {
	beego.Controller
}

func (c *GetVersion) Get() {
	/*o := orm.NewOrm()
	  qs := o.QueryTable("SoftUpdateMsg")
	  var maps []orm.Params
	  num, err := qs.Values(&maps, "VersionNumber", "EncryptionWay", "AllFileName", "AllFIleCode")
	  if err == nil {
	          for nu, m := range maps {
	                  //res := string(m["VersionNumber"])
	                  fmt.Println("type maps params -----------------:", m["VersionNumber"], nu)
	                  //c.Ctx.WriteString(res)
	                  if int64(nu) == num-1 {
	                          //c.Ctx.WriteString(m["VersionNumber"].(string))
	                          c.Data["json"] = map[string]interface{}{"version": m["VersionNumber"], "way": m["EncryptionWay"], "filename": m["AllFileName"], "filecode": m["AllFIleCode"]}
	                          c.ServeJSON()
	                  }
	          }
	  }*/
	path := "updatalist.json"
	resbytes, _ := ioutil.ReadFile(path)
	fmt.Println("execalgodata ------- resbytes", resbytes)
	c.Ctx.WriteString(string(resbytes))
}

type SoftUpdate struct {
	beego.Controller
}

func (c *SoftUpdate) Post() {
	fmt.Println("softupdate post getstring ----:", c.GetString("version"), c.GetString("filename"))
	version := c.GetString("version")
	filename := c.GetString("filename")
	path := version + "/" + filename
	c.Ctx.Output.Download(path)
}

type DiffFile struct {
	beego.Controller
}

func (c *DiffFile) Post() {
	fmt.Println("========d/DiffFile", c.GetString("username"))
	c.Ctx.WriteString("SucDiffFile")
}

type GetAllDev struct {
	beego.Controller
}

func (c *GetAllDev) Post() {
	fmt.Println("========d/GetAllDev", c.GetString("username"))
	username := c.GetString("username")
	usertype := c.GetString("usertype")
	o := orm.NewOrm()
	qs := o.QueryTable("OperatorRelatedDev")
	qs1 := o.QueryTable("DevRunStatus")
	qs2 := o.QueryTable("DevBasicInfo")
	qs3 := o.QueryTable("FinalUserOwnDev")
	if usertype == "final" {
		var maps []orm.Params
		num, err := qs3.Filter("UserName", username).Values(&maps, "DevId")
		list := make([]string, num, num)
		list1 := make([]string, num, num)
		list2 := make([]string, num, num)
		if err == nil {
			for n, m := range maps {
				list[n] = m["DevId"].(string)
				fmt.Println("devid------------:", list[n])
				list1[n] = QueryDev(qs1, list[n], "DevLastLoginIp")
				list2[n] = QueryDev(qs2, list[n], "DevConnIp")
			}
			c.Data["json"] = map[string]([]string){"devid": list, "LastIp": list1, "devip": list2}
			c.ServeJSON()
			return
		}
	} else if usertype == "operate" {
		var maps []orm.Params
		num, err := qs.Filter("UserName", username).Values(&maps, "DevId")
		list := make([]string, num, num)
		list1 := make([]string, num, num)
		list2 := make([]string, num, num)
		if err == nil {
			for n, m := range maps {
				list[n] = m["DevId"].(string)
				fmt.Println("devid------------:", list[n])
				list1[n] = QueryDev(qs1, list[n], "DevLastLoginIp")
				list2[n] = QueryDev(qs2, list[n], "DevConnIp")
			}
		}
		c.Data["json"] = map[string]([]string){"devid": list, "LastIp": list1, "devip": list2}
		c.ServeJSON()
		return
	}

	//c.Ctx.WriteString("GetAllDev")
}
func QueryDev(q orm.QuerySeter, devid string, queryFiled string) string {
	var maps []orm.Params
	num, err := q.Filter("DevId", devid).Values(&maps, queryFiled)
	var result string
	if err == nil && num == 1 {
		for _, m := range maps {
			result = m[queryFiled].(string)
		}
	}
	return result
}

type GetDevInfo struct {
	beego.Controller
}

func (c *GetDevInfo) Get() {
	fmt.Println("========d/SetDevInfo", c.GetString("username"))
	devid := c.GetString("devid")
	if devid == "" {
		c.Ctx.WriteString("FailGetDevInfo")
		return
	}
	path := "/mnt/webdata/devcfg/" + devid + "cfg.json"
	c.Ctx.Output.Download(path)
}

//下载执行脚本
type GetScriptFile struct {
	beego.Controller
}

func (c *GetScriptFile) Get() {
	fmt.Println("========d/GetScriptFile", c.GetString("p1"), c.GetString("p2"))
	devid := c.GetString("p2")
	scripttype := c.GetString("p1")
	path := "/mnt/webdata/devscript/" + devid + "/" + scripttype + "/" + devid + "main.lua"
	c.Ctx.Output.Download(path)
}

type ExecalgoData struct {
	beego.Controller
}

//websocket通知
func (c *ExecalgoData) Post() {
	fmt.Println("========d/ExecalgoData", c.GetString("devid"))
	//f, _ := ioutil.ReadFile("upload1.log")
	devid := c.GetString("devid")
	//path := "caldata/" + devid + ".json"
	//res := c.GetString("file")
	//res1, _, _ := c.GetFile("file")
	//buf := make([]byte, 2048)
	/*buf := make([]byte, 1024)
	  var bufres []byte
	  for {
	          resbytes1, _ := res1.Read(buf)
	          if resbytes1 == 1024 {
	                  bufres = append(bufres, buf...)
	          } else if resbytes1 > 0 && resbytes1 < 1024 {
	                  bufres = append(bufres, buf[:resbytes1]...)
	          } else {
	                  break
	          }
	  }*/
	//resbytes1, _ := res1.Read(buf)
	/*fmt.Println("execalgodata ------- bufres", bufres)

	  var res12 map[string]interface{}

	  err5 := json.Unmarshal(bufres, &res12)
	  if err5 != nil {
	          fmt.Println("unmarshal json : err5 ", err5)
	  }
	  //fmt.Println("execalgodata ------- filesize", res1)
	  fmt.Println("execalgodata ------- buf", buf)
	  fmt.Println("execalgodata ------- res", res12)*/
	/*
	   var res map[string]interface{}

	   err3 := json.Unmarshal(resbytes, &res)
	   if err3 != nil {
	           fmt.Println("unmarshal json : err ", err3)
	   }

	   fmt.Println("execalgodata ------- res", res)*/

	//f2, _ := file1.Open()
	//fmt.Println("execalgodata--------", res, []byte(file1))
	//fmt.Println("execalgodata--------", res.Read(f2), file1.Filename)
	/*err1 := c.SaveToFile("file", path)
	  if err1 != nil {
	          c.Ctx.WriteString("FailExecalgoData")
	  }*/
	/*
	   resbytes, _ := ioutil.ReadFile(path)
	   //ioutil.ReadFile(res1)
	   fmt.Println("execalgodata ------- resbytes", resbytes)
	   var res map[string]interface{}

	   err3 := json.Unmarshal(resbytes, &res)
	   if err3 != nil {
	           fmt.Println("unmarshal json : err ", err3)
	   }

	   fmt.Println("execalgodata ------- res", res)*/
	//Ws.WriteMessage(1, []byte("ExecalgoData"))

	rs := RedisClient.Get()
	defer rs.Close()
	//将计算结果存进内存
	res12 := c.GetString("file")
	key := "devpathdata" + devid
	_, err2 := rs.Do("set", key, res12)
	if err2 != nil {
		c.Ctx.WriteString("set caldata error")
		return
	}
	respub := make(map[string]interface{})
	respub["Devid"] = devid
	respub["WSSType"] = "caldatatp"
	respub["Data"] = res12

	str, err3 := json.Marshal(respub)
	if err3 != nil {
		fmt.Println("respub marshal json err3", err3)
	}

	replay, err4 := rs.Do("publish", "test1", string(str))
	if err4 != nil {
		fmt.Println("respub publish test1 err4", err4)
	}
	fmt.Println("respub test1 replay ", replay)
	/*err := Ws.WriteJSON(map[string]interface{}{"Devid": devid, "WSSType": "caldatatp", "data": res12})
	  if err != nil {
	          c.Ctx.WriteString("SucExecUploadRun WebSocket error")
	          return
	  }*/

	c.Ctx.WriteString("SucExecalgoData")
}

type ExecUploadPic struct {
	beego.Controller
}

//websocket通知
func (c *ExecUploadPic) Post() {
	fmt.Println("========d/ExecUploadPic", c.GetString("devid"), c.GetString("picaddr"))
	//f, _ := ioutil.ReadFile("upload1.log")
	devid := c.GetString("devid", " ")
	picaddr := c.GetString("picaddr", " ")
	if devid == " " || picaddr == " " {
		c.Ctx.WriteString("FailExecUploadPic")
		return
	}

	//通知页面
	/*
	   err := Ws.WriteJSON(map[string]string{"Devid": devid, "WSSType": "currentpicaddrtp", "CurrentPicAddr": picaddr})
	   if err != nil {
	           c.Ctx.WriteString("SucExecUploadRun WebSocket error")
	           return
	   }*/

	/*rs, err := redis.Dial("tcp", "127.0.0.1:6379")
	  if err != nil {
	          fmt.Println("redis conn errr")
	  }*/

	respub := make(map[string]interface{})
	pictmp := make(map[string]interface{})
	pictmp["CurrentPicAddr"] = picaddr
	respub["Devid"] = devid
	respub["WSSType"] = "currentpicaddrtp"
	respub["Data"] = pictmp

	rs := RedisClient.Get()
	defer rs.Close()

	key := "CurrentPicAddr" + devid
	_, err2 := rs.Do("set", key, picaddr)
	if err2 != nil {
		fmt.Println("upload curpic error")
	}

	str, err3 := json.Marshal(respub)
	if err3 != nil {
		fmt.Println("respub marshal json err3", err3)
	}

	replay, err4 := rs.Do("publish", "test1", string(str))
	if err4 != nil {
		fmt.Println("respub publish test1 err4", err4)
	}
	fmt.Println("respub test1 replay ", replay)

	o := orm.NewOrm()
	qs := o.QueryTable("DevRunStatus")
	num, err1 := qs.Filter("DevId", devid).Update(orm.Params{"CurrentPicAddr": picaddr})
	fmt.Println("========d/ExecUploadPic", num, err1)
	if err1 == nil {
		c.Ctx.WriteString("SucExecUploadPic")
	} else {
		c.Ctx.WriteString("FailExecUploadPic")
	}

}

type ExecUploadState struct {
	beego.Controller
}

//websocket通知
func (c *ExecUploadState) Post() {
	fmt.Println("========d/ExecUploadState", c.GetString("state"), c.GetString("p2"))
	devid := c.GetString("devid")
	//f, _ := ioutil.ReadFile("upload1.log")

	//Ws.WriteJSON("ececuploadstate")
	/*err := Ws.WriteJSON(map[string]string{"Devid": devid, "WSSType": "devstatustp", "data": "data"})
	  if err != nil {
	          c.Ctx.WriteString("FailExecUploadRun WebSocket error")
	          return
	  }*/
	state := c.GetString("state")
	rs := RedisClient.Get()
	defer rs.Close()

	stateint, _ := strconv.Atoi(state)
	statejudge := stateint / 10000
	var codemeaning string
	//先判断redis中是否有运行状态异常表，如没有就先进行将表缓存入redis中，然后再进行操作
	//设备运行状态表明为，devruncodemsg
	devcodelist := []interface{}{"devruncodemsg", "code", "codemeaning"}
	v, err := redis.Values(rs.Do("hmget", devcodelist...))
	fmt.Println(v, err)
	if err != nil || v[0] == nil {
		data := make(map[string][]string)
		data["code"] = []string{"20001", "30001", "40001"}
		data["codemeaning"] = []string{"致命错误", "异常", "警告"}
		tableall := []interface{}{"devruncodemsg"}
		for k, v := range data {
			tableall = append(tableall, k, v)
		}
		if _, err1 := rs.Do("hmset", tableall...); err1 != nil {
			fmt.Println(err1)
		}
		if statejudge == 2 {
			codemeaning = "致命错误"
		} else if statejudge == 3 {
			codemeaning = "异常"
		} else if statejudge == 4 {
			codemeaning = "警告"
		} else {
			codemeaning = " "
		}
		fmt.Println("更新缓存中的数据---------")
	} else {
		//如果正常获取缓存数据，则解析表数据
		resdata := make([]string, len(v))
		datalistfinal := make([][]string, len(v))
		for k, l := range v {
			b := make([]byte, len(l.([]uint8)))
			for k1, l1 := range l.([]uint8) {
				b[k1] = byte(l1)
			}
			resdata[k] = string(b)
			datalistfinal[k] = mashelredisdata(resdata[k])
		}

		fmt.Println("解析缓存中的表单数据---------->>>>>>>>>>>", datalistfinal)

		if statejudge == 2 {
			codemeaning = datalistfinal[1][0]
		} else if statejudge == 3 {
			codemeaning = datalistfinal[1][1]
		} else if statejudge == 4 {
			codemeaning = datalistfinal[1][2]
		} else {
			codemeaning = " "
		}
	}

	respub := make(map[string]interface{})
	statustmp := make(map[string]interface{})
	statustmp["devicerunstate"] = codemeaning
	statustmp["devicerunstatecode"] = state
	respub["Devid"] = devid
	respub["WSSType"] = "devstatustp"
	respub["Data"] = statustmp

	str, err3 := json.Marshal(respub)
	if err3 != nil {
		fmt.Println("respub marshal json err3", err3)
	}

	replay, err6 := rs.Do("publish", "test1", string(str))
	if err6 != nil {
		fmt.Println("respub publish test1 err4", err6)
	}
	fmt.Println("respub test1 replay ", replay)

	c.Ctx.WriteString("SucExecUploadState")
}

//解析缓存中读取的字符列表,该解析方式不能解析中文
func mashelredisdata(v string) []string {
	var resstring []string
	var pos int
	i := 0
	for k, l := range v {
		if i == 0 && l == 32 {
			resstring = append(resstring, string(v[1:k]))
			i = i + 1
			pos = k
		} else if l == 32 {
			resstring = append(resstring, string(v[pos+1:k]))
			pos = k
		} else if l == 93 {
			resstring = append(resstring, string(v[pos+1:k]))
		}

	}
	return resstring
}

type ExecUploadRun struct {
	beego.Controller
}

//websocket推送消息
func (c *ExecUploadRun) Post() {
	p := c.GetString("p1")
	fmt.Println("========d/ExecUploadRun", p)
	devid := c.GetString("devid")
	processcode := c.GetString("Schedule")
	//f, _ := ioutil.ReadFile("upload1.log")

	//Ws.WriteJSON("execuploadstate")

	rs := RedisClient.Get()
	defer rs.Close()
	key1 := "devcodeprocess" + processcode
	devprocessnum, err := redis.String(rs.Do("get", key1))
	var devdesp string
	if err != nil {
		rs.Do("set", "devcodeprocess11", "0")
		rs.Do("set", "devcodeprocessmsg11", "空闲")
		rs.Do("set", "devcodeprocess12", "20")
		rs.Do("set", "devcodeprocessmsg12", "采集")
		rs.Do("set", "devcodeprocess13", "40")
		rs.Do("set", "devcodeprocessmsg13", "识别")
		rs.Do("set", "devcodeprocess14", "60")
		rs.Do("set", "devcodeprocessmsg14", "用户操作")
		rs.Do("set", "devcodeprocess15", "80")
		rs.Do("set", "devcodeprocessmsg15", "运行")
		rs.Do("set", "devcodeprocess10", " ")
		rs.Do("set", "devcodeprocessmsg10", "异常")
	} else {
		key1 = "devcodeprocessmsg" + processcode
		devdesp, _ = redis.String(rs.Do("get", key1))
	}
	fmt.Println("execuploadrun result devdesp devprocessnum", devdesp, devprocessnum)
	respub := make(map[string]interface{})
	processtmp := make(map[string]interface{})
	processtmp["devicerunprogress"] = devdesp
	processtmp["devicerunprogresscode"] = devprocessnum
	respub["Devid"] = devid
	respub["WSSType"] = "devprocesstp"
	respub["Data"] = processtmp

	str, err3 := json.Marshal(respub)
	if err3 != nil {
		fmt.Println("respub marshal json err3", err3)
	}

	replay, err6 := rs.Do("publish", "test1", string(str))
	if err6 != nil {
		fmt.Println("respub publish test1 err4", err6)
	}
	fmt.Println("respub test1 replay ", replay)
	/*err := Ws.WriteJSON(map[string]string{"Devid": devid, "WSSType": "devprocesstp", "data": "devprocesstp"})
	  if err != nil {
	          c.Ctx.WriteString("SucExecUploadRun WebSocket error")
	          return
	  }*/
	//判断空闲之前是否运行，15变为11则执行以下加一操作，如果直接11则不执行加一操作
	key2 := "devjudgeaddsuc" + devid
	if processcode == "15" {
		rs.Do("set", key2, "true")
	}
	judgeadd, err7 := redis.String(rs.Do("get", key2))
	if err7 != nil {
		fmt.Println("get devjudgeaddsuc error")
	}
	if judgeadd == "true" && processcode == "11" {
		//当当前设备完成到最后一步时，此时给设备编号计数加一，获取缓存中当前设备操作者名下操作计数加一
		o := orm.NewOrm()
		/*rsc, err1 := redis.Dial("tcp", "127.0.0.1:6379")
		  if err1 != nil {
		          fmt.Println(err1)
		          return
		  }*/

		key := "currentoperator" + devid
		v, err2 := redis.String(rs.Do("get", key))
		if err2 != nil {
			fmt.Println("当前设备没有操作者", devid)
		} else {
			qsopday := o.QueryTable("OperatorDayMsg").Filter("OperatorName", v)
			var devopcountlist []orm.ParamsList
			_, err3 := qsopday.ValuesList(&devopcountlist, "DaySuccessedCount", "DayFailedCount")
			if err3 != nil {
				fmt.Println("devcountmsg query daysuccount dayfailcount fail")
			}
			var opdaysuc int64
			var opdayfail int64
			for _, l := range devopcountlist {
				opdaysuc = l[0].(int64)
				opdayfail = l[0].(int64)
			}
			opdaysuc = opdaysuc + 1
			_, err3 = qsopday.Update(orm.Params{"DaySuccessedCount": opdaysuc})
			if err3 != nil {
				fmt.Println("opdaysuc update err3", err3)
			}
			fmt.Println("daysuc,dayfail", opdaysuc, opdayfail)

		}
		//给设备标号为id的设备统计表中插入
		qsfdevid := o.QueryTable("DevCountMsg").Filter("DevId", devid)
		var devcountlist []orm.ParamsList
		_, err4 := qsfdevid.ValuesList(&devcountlist, "DaySuccessedCount", "DayFailedCount")
		if err4 != nil {
			fmt.Println("devcountmsg query daysuccount dayfailcount fail")
		}
		var daysuc int64
		var dayfail int64
		for _, l := range devcountlist {
			daysuc = l[0].(int64)
			dayfail = l[1].(int64)
		}
		//当前为成功执行一次加一，目前无失败条件判断
		daysuc = daysuc + 1
		_, err5 := qsfdevid.Update(orm.Params{"DaySuccessedCount": daysuc})
		if err5 != nil {
			fmt.Println("day success add 1 fail", err4)
		}
		fmt.Println("daysuc,dayfail", daysuc, dayfail)
		//成功执行完成加一，发布消息
		respub1 := make(map[string]interface{})
		processtmp1 := make(map[string]interface{})
		processtmp1["devicedaysucoperatesum"] = daysuc
		processtmp1["devicedayfailoperatesum"] = dayfail
		respub1["Devid"] = devid
		respub1["WSSType"] = "devprocessfintp"
		respub1["Data"] = processtmp1

		str1, err7 := json.Marshal(respub1)
		if err7 != nil {
			fmt.Println("respub marshal json err3", err7)
		}

		_, err8 := rs.Do("publish", "test1", string(str1))
		if err8 != nil {
			fmt.Println("respub publish test1 err4", err8)
		}

		//设置标志位为false
		rs.Do("set", key2, "false")
	}

	c.Ctx.WriteString("SucExecUploadRun")
}

type ExecGetallgoData struct {
	beego.Controller
}

func (c *ExecGetallgoData) Get() {
	fmt.Println("========d/ExecGetallgoData", c.GetString("p1"), c.GetString("devid"))
	param := c.GetString("p1", " ")
	devid := c.GetString("devid", " ")
	if param == " " || devid == " " {
		c.Ctx.WriteString("FailExecGetallgoData")
		return
	}
	ChoiceFunc(param, c, devid)
}
func ChoiceFunc(param string, c *ExecGetallgoData, devid string) {
	o := orm.NewOrm()
	//qs := o.QueryTable("DevRunStatus")
	//qs1 := o.QueryTable("DevBasicInfo")
	table1 := "DevRunStatus"
	table2 := "DevBasicInfo"
	rsc := RedisClient.Get()
	defer rsc.Close()
	switch param {
	case "A":
		//c.Ctx.Output.Download("caldata/" + devid + ".json")
		key := "devpathdata" + devid
		v, err2 := redis.String(rsc.Do("get", key))
		if err2 != nil {
			c.Ctx.WriteString("get caldata error")
		}
		c.Ctx.WriteString(v)
	case "B":
		/*result := QueryChoiceFunc(o, table1, "DevSpeed", devid)
		  c.Ctx.WriteString(result)*/
		/*rsc, err1 := redis.Dial("tcp", "127.0.0.1:6379")
		  if err1 != nil {
		          fmt.Println(err1)
		          return
		  }*/

		key := "devspeed" + devid
		v, err2 := redis.String(rsc.Do("get", key))
		fmt.Println("B ", v)
		if err2 == nil {
			c.Ctx.WriteString(v)
		} else {
			c.Ctx.WriteString("FailGetSpeed")
		}

	case "C":
		/*result := QueryChoiceFunc(o, table1, "UserIntevent", devid)
		  c.Ctx.WriteString(result)*/
		/*rsc, err1 := redis.Dial("tcp", "127.0.0.1:6379")
		  if err1 != nil {
		          fmt.Println(err1)
		          return
		  }*/

		key := "usercontrol" + devid
		v, _ := redis.String(rsc.Do("get", key))
		fmt.Println("c ", v)
		if v == "true" {
			c.Ctx.WriteString("yes")
		} else {
			c.Ctx.WriteString("no")
		}

	case "D":
		/*result := QueryChoiceFunc(o, table1, "UserInteventTag", devid)
		  c.Ctx.WriteString(result)*/
		/*rsc, err1 := redis.Dial("tcp", "127.0.0.1:6379")
		  if err1 != nil {
		          fmt.Println(err1)
		          return
		  }*/
		rsc := RedisClient.Get()
		defer rsc.Close()
		key := "devrun" + devid
		v, err1 := redis.String(rsc.Do("get", key))
		if err1 != nil {
			rsc.Do("set", key, "false")
		}
		if v == "true" {
			rsc.Do("set", key, "false")
			c.Ctx.WriteString("yes")
		} else {
			c.Ctx.WriteString("no")

		}

	case "E":
		result := QueryChoiceFunc(o, table2, "AlgorAddUrl", devid)
		c.Ctx.WriteString(result)
	case "F":
		result := QueryChoiceFunc(o, table2, "AlgorSceret", devid)
		c.Ctx.WriteString(result)
	case "G":
		result := QueryChoiceFunc(o, table2, "DevCamraCode", devid)
		c.Ctx.WriteString(result)
	case "H":
		result := QueryChoiceFunc(o, table2, "DevCamraIp", devid)
		c.Ctx.WriteString(result)
	case "I":
		result := QueryChoiceFunc(o, table1, "DevProcessCode", devid)
		c.Ctx.WriteString(result)
	case "J":
		key := "devstoprun" + devid
		v, err1 := redis.String(rsc.Do("get", key))
		if err1 != nil {
			rsc.Do("set", key, "false")
		}
		if v == "true" {
			rsc.Do("set", key, "false")
			c.Ctx.WriteString("yes")
		} else {
			c.Ctx.WriteString("no")

		}
	}
}
func QueryChoiceFunc(o orm.Ormer, table string, filedname string, devid string) string {
	var maps []orm.Params
	var result string
	q := o.QueryTable(table)
	_, err := q.Filter("Devid", devid).Values(&maps, filedname)
	if err == nil {
		for _, m := range maps {
			result = m[filedname].(string)
		}
	}
	return result
}

type ExecPostProcess struct {
	beego.Controller
}

//webscoket消息推送
func (c *ExecPostProcess) Post() {
	fmt.Println("========d/ExecPostProcess", c.GetString("devid"))
	//f, _ := ioutil.ReadFile("upload1.log")
	devid := c.GetString("devid")
	/*path := "devprocess/" + devid + ".xml"
	  err1 := c.SaveToFile("file", path)*/

	/*err := Ws.WriteJSON(map[string]string{"devid": devid, "WSSType": "devexeprocesstp"})
	  if err != nil {
	          c.Ctx.WriteString("SucExecUploadRun WebSocket error")
	          return
	  }*/
	index := c.GetString("curProcessDsc")
	respub := make(map[string]interface{})
	tmp := make(map[string]interface{})
	tmp["curProcessDsc"] = index
	respub["Devid"] = devid
	respub["WSSType"] = "devprocessexepathtp"
	respub["Data"] = tmp

	rs := RedisClient.Get()
	defer rs.Close()

	key := "curProcessDsc" + devid
	_, err2 := rs.Do("set", key, index)
	if err2 != nil {
		fmt.Println("curprocessdsc set error")
	}

	str, err3 := json.Marshal(respub)
	if err3 != nil {
		fmt.Println("respub marshal json err3", err3)
	}

	replay, err6 := rs.Do("publish", "test1", string(str))
	if err6 != nil {
		fmt.Println("respub publish test1 err4", err6)
	}
	fmt.Println("respub test1 replay ", replay)

	/*if err1 != nil {
	        fmt.Println("execpostprocess ------", err1)
	        c.Ctx.WriteString("FailExecPostProcess")
	        return
	}*/

	c.Ctx.WriteString("SucExecPostProcess")
}

type ExecPostCamraip struct {
	beego.Controller
}

func (c *ExecPostCamraip) Post() {
	fmt.Println("========d/ExecPostCamraip", c.GetString("camraip"))
	camraip := c.GetString("camraip")
	devid := c.GetString("devid")
	o := orm.NewOrm()
	_, err := o.QueryTable("DevBasicInfo").Filter("DevId", devid).Update(orm.Params{"DevCamraIp": camraip})
	if err == nil {
		c.Ctx.WriteString("SucExecPostCamraip")
	} else {
		c.Ctx.WriteString("FailExecPostCamraip")
	}
}

//软件日志存储
type StoreSoftLog struct {
	beego.Controller
}

func (c *StoreSoftLog) Post() {
	fmt.Println("========d/getalldev", c.GetString("name"), c.SaveToFile("file", c.GetString("name")+".log"))
	c.Ctx.WriteString("SucStoreSoftLog")
}

//硬件日志存储
type StoreHardLog struct {
	beego.Controller
}

func (c *StoreHardLog) Post() {
	fmt.Println("========d/StoreHardLog", c.GetString("name1"), c.SaveToFile("file1", c.GetString("name1")+".log"))
	c.Ctx.WriteString("SucStoreHardLog")
}
