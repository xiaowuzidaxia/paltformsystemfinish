package controllers

import (
	"fmt"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	//"paltformsystem/paltformsystem/models"
	"crypto/md5"
	"encoding/hex"
	"github.com/astaxie/beego/cache"
	_ "github.com/astaxie/beego/cache/redis"
	"github.com/garyburd/redigo/redis"
	"time"
)

//登录页面请求
type MainController struct {
	beego.Controller
}

var localIp string   //获取本机内网ip
var localPort string //获取本机访问端口
var RedisIp string   //获取缓存redis的ip
//var RedisDb int      //获取redis的数据库名

func (c *MainController) Get() {
	localIp = beego.AppConfig.String("httpaddr")
	fmt.Println("running ip ----->:" + localIp)
	localPort = beego.AppConfig.String("httpport")
	fmt.Println("running port ----->:" + localPort)
	RedisIp = beego.AppConfig.String("redis_host")
	fmt.Println("running RedisIp ----->:" + RedisIp)
	//RedisDb = beego.AppConfig.Int("redis_db")
	//fmt.Println("running RedisDb ----->:" + RedisDb)
	c.TplName = "login.html"
}

//uishow页面请求
type UiShowControl struct {
	beego.Controller
}

var UserName string

//全局redis连接对象
var rs cache.Cache

func (c *UiShowControl) Post() {
	username := c.GetString("username", "")
	password := c.GetString("password", "")
	companyname := c.GetString("companyname", "")

	//计算username,passowrd,companyname的md5值
	h := md5.New()
	h.Write([]byte(username + password + companyname))
	hresult := hex.EncodeToString(h.Sum(nil))
	fmt.Println("-----------md5 result ======", hresult)
	//获取redis连接对象
	rs, _ = cache.NewCache("redis", `{"conn":"127.0.0.1:6379", "key":"beecacheRedis"}`)

	var final bool
	var operate bool
	//先判断缓存中是否有这三个值的缓存
	res1, err1 := GetCache(hresult)

	if err1 == true {
		c.SetSession("islogin", true)
		if res1 == "final" {
			c.TplName = "uishow.html"
		} else if res1 == "operate" {
			c.TplName = "uicontrol.html"
		}
		return

	} else {
		final = FirstCheck(username, password, companyname, "FinalUserInfo")
		operate = FirstCheck(username, password, companyname, "OperateUserInfo")
		fmt.Println("final-----operate-----:", final, operate)
	}
	if final == true && operate == false {
		c.SetSession("islogin", true)
		SetCache(hresult, "final")
		//ses := c.GetSession("islogin")
		//fmt.Println(username, password, ses)
		c.TplName = "uishow.html"
	} else if final == false && operate == true {
		c.SetSession("islogin", true)
		SetCache(hresult, "operate")
		//ses := c.GetSession("islogin")
		//fmt.Println(username, password, ses)
		c.TplName = "uicontrol.html"
	} else {
		fmt.Println("redirect login")
		c.Redirect("/", 302)
	}
}

func GetCache(key string) (string, bool) {
	result := rs.Get(key)
	var err2 error
	res1, _ := redis.String(result, err2)
	if result != nil {
		return res1, true
	} else {
		return "", false
	}
}

func SetCache(key string, value string) bool {

	//value := []byte("wuzi")
	err := rs.Put(key, value, 3000*time.Second)
	//将读取数据转换为字节数组、好字符串转换
	//wuzi1 := rs.Get("wuzi1").([]byte)
	//fmt.Println(string(wuzi1))

	//获取redis取出的值
	/*result := rs.Get(key)
	var err2 error
	res1, _ := redis.String(result, err2)*/

	if err == nil {
		return true
	} else {
		return false
	}
}

func FirstCheck(username string, password string, companyname string, TableName string) bool {
	o := orm.NewOrm()
	qs := o.QueryTable(TableName)

	var maps []orm.Params
	num, err := qs.Filter("UserName", username).Filter("UserPassword", password).Filter("CompanyName", companyname).Values(&maps, "UserName", "UserPassword", "CompanyName")
	fmt.Println("qs result ----------->", len(maps))
	if num == 1 && err == nil {
		return true
	} else {
		return false
	}

}

//退出登录删除session回话
type DeleteSessionControl struct {
	beego.Controller
}

func (c *DeleteSessionControl) Get() {
	c.DelSession("islogin")
	c.Redirect("/", 302)
	c.Ctx.WriteString("delsession")
	return

}
