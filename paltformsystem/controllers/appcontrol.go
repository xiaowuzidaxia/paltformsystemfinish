package controllers

import (
	"errors"
	"fmt"
	"github.com/astaxie/beego"
	//"github.com/astaxie/beego/cache"
	"encoding/json"
	"github.com/astaxie/beego/orm"
	//"github.com/axgle/mahonia"
	"github.com/bitly/go-simplejson"
	"github.com/garyburd/redigo/redis"
	"io/ioutil"
	"paltformsystem/paltformsystem/models"
	"strconv"
	"time"
	//"reflect"
	//"unicode/utf8"
)

type AppFirst struct {
	beego.Controller
}

func (c *AppFirst) Get() {
	fmt.Println("ok")
	c.Ctx.WriteString("appfirst")
}

type AppLogin struct {
	beego.Controller
}

func (c *AppLogin) Post() {
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
	          c.SetSession("applogin", true)
	          c.SetSession("islogin", true)
	          if res1 == "final" {
	                  fmt.Println("applogin session=====:", c.GetSession("applogin"))
	                  c.SetSession("username", username)
	                  c.SetSession("companyname", companyname)
	                  c.Ctx.WriteString("admin")
	          } else if res1 == "operate" {
	                  c.Ctx.WriteString("employ")
	                  c.SetSession("username", username)
	                  c.SetSession("companyname", companyname)
	          } else if res1 == "visitor" {
	                  c.Ctx.WriteString("visitor")
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
		c.SetSession("applogin", true)
		c.SetSession("islogin", true)
		c.SetSession("username", username)
		c.SetSession("companyname", companyname)
		SetCache(hresult, "final")
		c.Ctx.WriteString("admin")
	} else if final == false && operate == true {
		c.SetSession("applogin", true)
		c.SetSession("islogin", true)
		c.SetSession("username", username)
		c.SetSession("companyname", companyname)
		SetCache(hresult, "operate")
		c.Ctx.WriteString("employ")
	} else {
		//查询是否为游客表中的数据
		//c.Ctx.WriteString("Faillogin")
		o := orm.NewOrm()
		qsvisiter := o.QueryTable("VistorToRegister")
		num, err := qsvisiter.Filter("UserName", username).Filter("Password", password).Filter("CompanyName", companyname).Count()
		if num == 1 && err == nil {
			c.SetSession("applogin", true)
			SetCache(hresult, "visitor")
			c.Ctx.WriteString("visitor")
			return
		}
		fmt.Println(num, err)
		c.Ctx.WriteString("Faillogin")
	}
}

type GetUserMessage struct {
	beego.Controller
}

func (c *GetUserMessage) Post() {
	usertype := c.GetString("usertype")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	if usertype == "" || username == "" || companyname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	if usertype == "admin" {
		var resdatalist []orm.ParamsList
		num, err := o.QueryTable("FinalUserInfo").Filter("UserName", username).Filter("CompanyName", companyname).ValuesList(&resdatalist, "PhoneNumber", "AccountPicture")
		if num == 1 && err == nil {
			respdata := make(map[string]string)
			for _, l := range resdatalist {
				respdata["phonenumber"] = l[0].(string)
				respdata["accountpicture"] = l[1].(string)
				respdata["username"] = username
			}
			c.Data["json"] = map[string]interface{}{"resp": respdata}
			c.ServeJSON()
			return
		} else {
			c.Data["json"] = map[string]string{"discb": "FinalUserInfo出错", "discbcss": "fail"}
			c.ServeJSON()
		}
	} else if usertype == "employ" {
		var resdatalist []orm.ParamsList
		num, err := o.QueryTable("OperateUserInfo").Filter("UserName", username).Filter("CompanyName", companyname).ValuesList(&resdatalist, "PhoneNumber", "AccountPicture")
		if num == 1 && err == nil {
			respdata := make(map[string]string)
			for _, l := range resdatalist {
				respdata["phonenumber"] = l[0].(string)
				respdata["accountpicture"] = l[1].(string)
				respdata["username"] = username
			}
			c.Data["json"] = map[string]interface{}{"resp": respdata}
			c.ServeJSON()
			return
		} else {
			c.Data["json"] = map[string]string{"discb": "OperateUserInfo出错", "discbcss": "fail"}
			c.ServeJSON()
		}
	} else {
		c.Data["json"] = map[string]string{"discb": "usertype类型出错", "discbcss": "fail"}
		c.ServeJSON()
	}
}

type MainDevList struct {
	beego.Controller
}

func (c *MainDevList) Get() {
	o := orm.NewOrm()
	var reslist []orm.ParamsList
	num, err := o.QueryTable("AppMainPage").ValuesList(&reslist, "ShowDevType", "DevTypeDesp")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "数据查询失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	listdevtype := make([]string, num, num)
	listtypedesp := make([]string, num, num)
	respdatalist := make([]interface{}, num+1, num+1)
	for i, l := range reslist {
		listdevtype[i] = l[0].(string)
		listtypedesp[i] = l[1].(string)
		data := make(map[string]string)
		data[listdevtype[i]] = listtypedesp[i]
		respdatalist[i] = data
	}
	var imgurllist []orm.ParamsList
	num1, err1 := o.QueryTable("AppRoundPageImgUrl").ValuesList(&imgurllist, "RoundPageImgUrl")
	if err1 != nil {
		c.Data["json"] = map[string]string{"discb": "获取轮播图失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	listimglist := make([]string, num1, num1)
	for i, l := range imgurllist {
		listimglist[i] = l[0].(string)
	}
	imgdata := make(map[string]interface{})
	imgdata["imageurl"] = listimglist
	respdatalist[num] = imgdata
	c.Data["json"] = map[string]interface{}{"resp": respdatalist}
	c.ServeJSON()
}

type DevListType struct {
	beego.Controller
}

func (c *DevListType) Get() {
	devtype := c.GetString("type")
	if devtype == "" {
		c.Data["json"] = map[string]string{"discb": "url传入参数有误", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	var subdevtypelist []orm.ParamsList
	num, err := o.QueryTable("AppEachDevDetail").Filter("FirstDevType", devtype).ValuesList(&subdevtypelist, "SubDevType", "SubDevTypeDesp")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "获取子设备类型失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	respdatalist := make([]interface{}, num, num)
	for i, l := range subdevtypelist {
		data := make(map[string]string)
		data[l[0].(string)] = l[1].(string)
		respdatalist[i] = data
	}
	c.Data["json"] = map[string]interface{}{"resp": respdatalist}
	c.ServeJSON()
}

type DevListTypeDetail struct {
	beego.Controller
}

func (c *DevListTypeDetail) Get() {
	devtype := c.GetString("type")
	if devtype == "" {
		c.Data["json"] = map[string]string{"discb": "url传入参数有误", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	var detaillist []orm.ParamsList
	num, err := o.QueryTable("AppDetailProduct").Filter("SubDevType", devtype).ValuesList(&detaillist, "SubDevTypeDesp", "SubDevTypeShow", "SubDevUsedTime", "SubDevPrice", "SubDevImgUrl")
	if num != 1 || err != nil {
		c.Data["json"] = map[string]string{"discb": "获取子设备详细信息失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	for _, l := range detaillist {
		c.Data["json"] = map[string]interface{}{"detailmsg": l[0], "type": l[1], "live": l[2], "price": l[3], "imageurl": l[4]}
		c.ServeJSON()
	}
}

type ContactUs struct {
	beego.Controller
}

func (c *ContactUs) Get() {
	o := orm.NewOrm()
	var contact []orm.ParamsList
	_, err := o.QueryTable("AppContactUs").ValuesList(&contact, "SalePhone", "TelConsult", "Email", "Website", "Address", "WeiXin")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "获取联系我们信息失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	for _, l := range contact {
		c.Data["json"] = map[string]interface{}{"salestel": l[0], "telconsult": l[1], "email": l[2], "website": l[3], "address": l[4]}
		c.ServeJSON()
	}
}

type UserAggree struct {
	beego.Controller
}

func (c *UserAggree) Get() {
	/*
	   o := orm.NewOrm()
	   var content []orm.ParamsList
	   _, err := o.QueryTable("UserAggreement").ValuesList(&content, "AggreementContent")
	   if err != nil {
	           c.Data["json"] = map[string]string{"discb": "获取用户协议信息失败", "discbcss": "fail"}
	           c.ServeJSON()
	           return
	   }
	   for _, l := range content {
	           c.Data["json"] = map[string]interface{}{"resp": l[0].(string)}
	           c.ServeJSON()
	   }*/
	c.Ctx.Output.Download("useraggree.txt")
}

type AboutUs struct {
	beego.Controller
}

func (c *AboutUs) Get() {
	o := orm.NewOrm()
	var content []orm.ParamsList
	_, err := o.QueryTable("AboutUs").ValuesList(&content, "UsContent")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "获取关于我们信息失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	for _, l := range content {
		c.Data["json"] = map[string]interface{}{"resp": l[0].(string)}
		c.ServeJSON()
	}
}

type VisitSignIn struct {
	beego.Controller
}

func (c *VisitSignIn) Post() {
	username := c.GetString("username")
	password := c.GetString("password")
	companyname := c.GetString("companyname")
	phonenumber := c.GetString("phonenumber")

	if username == "" || password == "" || companyname == "" || phonenumber == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	//查询游客注册表是否存在重名
	num, err := o.QueryTable("VistorToRegister").Filter("CompanyName", companyname).Filter("UserName", username).Count()
	if num != 0 || err != nil {
		c.Data["json"] = map[string]string{"discb": "用户名和公司名已注册", "discbcss": "fail"}
		c.ServeJSON()
		return
	}

	visitormsg := new(models.VistorToRegister)
	visitormsg.UserName = username
	visitormsg.Password = password
	visitormsg.CompanyName = companyname
	visitormsg.PhoneNumber = phonenumber
	_, err1 := o.Insert(visitormsg)
	if err1 != nil {
		c.Data["json"] = map[string]string{"discb": "注册信息插入错误", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]string{"discb": "注册信息插入成功", "discbcss": "suc"}
	c.ServeJSON()
}

type GetAddress struct {
	beego.Controller
}

func (c *GetAddress) Post() {
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	if username == "" || companyname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	var addresslist []orm.ParamsList
	num, err := o.QueryTable("ReceiverAddress").Filter("CompanyName", companyname).Filter("UserName", username).ValuesList(&addresslist, "RecUserName", "RecPhoneNumber", "RecRoughAddr", "Id", "RecSex", "Remark", "RecDetailAddr")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "获取收货地址信息错误错误", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	respnamelist := make([]string, num, num)
	respphonelist := make([]string, num, num)
	respaddresslist := make([]string, num, num)
	respidlist := make([]int64, num, num)
	respsexlist := make([]string, num, num)
	respmarklist := make([]string, num, num)
	respdetaillist := make([]string, num, num)
	for i, l := range addresslist {
		respnamelist[i] = l[0].(string)
		respphonelist[i] = l[1].(string)
		respaddresslist[i] = l[2].(string)
		respidlist[i] = l[3].(int64)
		respsexlist[i] = l[4].(string)
		respmarklist[i] = l[5].(string)
		respdetaillist[i] = l[6].(string)
	}
	c.Data["json"] = map[string]interface{}{"name": respnamelist, "phone": respphonelist, "address": respaddresslist, "id": respidlist,
		"sex": respsexlist, "mark": respmarklist, "detail": respdetaillist}
	c.ServeJSON()
}

type AddAddress struct {
	beego.Controller
}

//ValuesList(&addresslist,"RecUserName","RecPhoneNumber","RecRoughAddr","RecDetailAddr","RecSex","Remark")
func (c *AddAddress) Post() {
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	recusername := c.GetString("recusername")
	recphonenumber := c.GetString("recphonenumber")
	recroughaddr := c.GetString("recroughaddr")
	recdetailaddr := c.GetString("recdetailaddr")
	recsex := c.GetString("recsex")
	remark := c.GetString("remark")
	if username == "" || companyname == "" || recusername == "" || recphonenumber == "" || recroughaddr == "" || recdetailaddr == "" || recsex == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	//先判断同一用户名下是否有相同的地址信息
	num, err := o.QueryTable("ReceiverAddress").Filter("CompanyName", companyname).Filter("UserName", username).Filter("RecUserName", recusername).Filter("RecPhoneNumber", recphonenumber).Filter("RecRoughAddr", recroughaddr).Filter("RecDetailAddr", recdetailaddr).Filter("RecSex", recsex).Filter("Remark", remark).Count()
	if num != 0 || err != nil {
		c.Data["json"] = map[string]string{"discb": "用户添加地址重复", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	address := new(models.ReceiverAddress)
	address.CompanyName = companyname
	address.UserName = username
	address.RecUserName = recusername
	address.RecPhoneNumber = recphonenumber
	address.RecRoughAddr = recroughaddr
	address.RecDetailAddr = recdetailaddr
	address.RecSex = recsex
	address.Remark = remark
	_, err1 := o.Insert(address)
	if err1 != nil {
		c.Data["json"] = map[string]string{"discb": "收货地址添加失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]string{"discb": "收货地址添加成功", "discbcss": "suc"}
	c.ServeJSON()
}

type ChangeAddress struct {
	beego.Controller
}

func (c *ChangeAddress) Post() {
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	recusername := c.GetString("recusername")
	recphonenumber := c.GetString("recphonenumber")
	recroughaddr := c.GetString("recroughaddr")
	recdetailaddr := c.GetString("recdetailaddr")
	recsex := c.GetString("recsex")
	remark := c.GetString("remark")
	id := c.GetString("id")
	if username == "" || companyname == "" || recusername == "" || recphonenumber == "" || recroughaddr == "" || recdetailaddr == "" || recsex == "" || remark == "" || id == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	_, err := o.QueryTable("ReceiverAddress").Filter("Id", id).Filter("CompanyName", companyname).Filter("UserName", username).Update(orm.Params{"RecUserName": recusername, "RecPhoneNumber": recphonenumber, "RecRoughAddr": recroughaddr, "RecDetailAddr": recdetailaddr, "RecSex": recsex, "Remark": remark})
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "提交收货地址更改失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]string{"discb": "提交收货地址更改成功", "discbcss": "suc"}
	c.ServeJSON()
}

type DelAddress struct {
	beego.Controller
}

func (c *DelAddress) Post() {
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	id := c.GetString("id")
	if username == "" || companyname == "" || id == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	_, err := o.QueryTable("ReceiverAddress").Filter("Id", id).Filter("CompanyName", companyname).Filter("UserName", username).Delete()
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "删除收货地址错误请再次尝试", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]string{"discb": "删除收货地址成功", "discbcss": "suc"}
	c.ServeJSON()
}

type ShowOrder struct {
	beego.Controller
}

func (c *ShowOrder) Post() {
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	if username == "" || companyname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	whether := "yes"
	finished, finbool := whetherdelivery(companyname, username, o, whether, c)
	fmt.Println("finished", finished)
	if finbool != true {
		c.Data["json"] = map[string]string{"discb": "获取订单详情出错", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	whether = "no"
	unfinished, unfinbool := whetherdelivery(companyname, username, o, whether, c)
	if unfinbool != true {
		c.Data["json"] = map[string]string{"discb": "获取订单详情出错", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]interface{}{"finished": finished, "unfinished": unfinished}
	c.ServeJSON()
}

func whetherdelivery(companyname string, username string, o orm.Ormer, whether string, c *ShowOrder) ([]interface{}, bool) {
	var respdatalist []orm.ParamsList
	num, err := o.QueryTable("MyOrder").Filter("CompanyName", companyname).Filter("UserName", username).Filter("WhetherDelivery", whether).ValuesList(&respdatalist, "DevType", "DevPrice", "DevNumber", "DevImgUrl")
	if err != nil {
		var result []interface{}
		return result, false
	}
	resultlist := make([]interface{}, num, num)
	for i, l := range respdatalist {
		data := make(map[string]string)
		data["devtype"] = l[0].(string)
		data["price"] = l[2].(string)
		data["numbers"] = l[2].(string)
		data["devimgurl"] = l[3].(string)
		resultlist[i] = data
	}
	return resultlist, true

}

type CreateOrder struct {
	beego.Controller
}

func (c *CreateOrder) Post() {
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	id := c.GetString("id")
	devtype := c.GetString("devtype")
	devprice := c.GetString("devprice")
	devnumber := c.GetString("devnumber")
	devimgurl := c.GetString("devimgurl")
	if username == "" || companyname == "" || id == "" || devtype == "" || devprice == "" || devnumber == "" || devimgurl == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	order := new(models.MyOrder)
	order.CompanyName = companyname
	order.UserName = username
	order.WhetherDelivery = "no"
	order.DevType = devtype
	order.DevPrice = devprice
	order.DevNumber = devnumber
	order.DevImgUrl = devimgurl
	order.AddressTableId = id
	_, err := o.Insert(order)
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "生产订单失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]string{"discb": "生产订单成功", "discbcss": "suc"}
	c.ServeJSON()
}

type AddToMyCollect struct {
	beego.Controller
}

func (c *AddToMyCollect) Post() {
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	devtype := c.GetString("devtype")
	if username == "" || companyname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	num, err := o.QueryTable("MyFavorite").Filter("CompanyName", companyname).Filter("UserName", username).Filter("SubDevType", devtype).Count()
	if num != 0 || err != nil {
		c.Data["json"] = map[string]string{"discb": "该类型设备已结被收藏", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	collect := new(models.MyFavorite)
	collect.CompanyName = companyname
	collect.UserName = username
	collect.SubDevType = devtype
	_, err1 := o.Insert(collect)
	if err1 != nil {
		c.Data["json"] = map[string]string{"discb": "添加到收藏失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]string{"discb": "添加到收藏成功", "discbcss": "suc"}
	c.ServeJSON()
}

type DelMyCollect struct {
	beego.Controller
}

func (c *DelMyCollect) Post() {
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	subdevtype := c.GetString("subdevtype")
	if username == "" || companyname == "" || subdevtype == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	num, err := o.QueryTable("MyFavorite").Filter("CompanyName", companyname).Filter("UserName", username).Filter("SubDevType", subdevtype).Delete()
	if num == 1 && err == nil {
		c.Data["json"] = map[string]string{"discb": "del suc", "discbcss": "suc"}
		c.ServeJSON()
		return
	} else {
		c.Data["json"] = map[string]string{"discb": "del fail", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
}

type MyCollect struct {
	beego.Controller
}

func (c *MyCollect) Post() {
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	if username == "" || companyname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	var devtypelist []orm.ParamsList
	num, err := o.QueryTable("MyFavorite").Filter("CompanyName", companyname).Filter("UserName", username).ValuesList(&devtypelist, "SubDevType")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "获取收藏信息失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	respdatalist := make([]interface{}, num, num)
	for i, l := range devtypelist {
		subdevtype := l[0].(string)
		var detaillist []orm.ParamsList
		_, err = o.QueryTable("AppDetailProduct").Filter("SubDevType", subdevtype).ValuesList(&detaillist, "SubDevTypeShow", "SubDevUsedTime", "SubDevPrice", "SubDevImgUrl")
		if err != nil {
			c.Data["json"] = map[string]string{"discb": "获取收藏信息失败", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
		respdetail := make(map[string]string)
		for _, l := range detaillist {
			respdetail["subdevtype"] = subdevtype
			respdetail["devtype"] = l[0].(string)
			respdetail["live"] = l[1].(string)
			respdetail["price"] = l[2].(string)
			respdetail["subdevimgurl"] = l[3].(string)
		}
		respdatalist[i] = respdetail
	}
	c.Data["json"] = map[string]interface{}{"resp": respdatalist}
	c.ServeJSON()
}

type UserFeedback struct {
	beego.Controller
}

func (c *UserFeedback) Post() {
	opinioncontent := c.GetString("opinioncontent")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	productrating := c.GetString("productrating")
	uilayout := c.GetString("uilayout")
	picturetotal, err := c.GetInt("picturetotal")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "get int picturetotal error", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	if opinioncontent == "" || username == "" || companyname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	for i := 0; i < picturetotal; i++ {
		picflag := "picture" + strconv.Itoa(i)
		_, h, err1 := c.GetFile(picflag)
		fmt.Println("#########################h.filename", h.Filename)
		if err1 != nil {
			c.Data["json"] = map[string]string{"discb": "获取图片失败", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
		t := int(time.Now().Unix())
		tstring := strconv.Itoa(t)
		path := username + "_" + companyname + "_" + tstring + "_" + h.Filename
		c.SaveToFile(picflag, path)
	}
	o := orm.NewOrm()
	userfeed := new(models.AppUserFeedback)
	userfeed.CompanyName = companyname
	userfeed.UserName = username
	userfeed.OpinionContent = opinioncontent
	userfeed.ProductRating = productrating
	userfeed.UILayout = uilayout
	_, err1 := o.Insert(userfeed)
	if err1 != nil {
		c.Data["json"] = map[string]string{"discb": "AppUserFeedback添加数据失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]interface{}{"discb": "更改成功", "discbcss": "suc"}
	c.ServeJSON()

}

type GetMessageList struct {
	beego.Controller
}

func (c *GetMessageList) Get() {
	o := orm.NewOrm()
	var msglist []orm.ParamsList
	num, err := o.QueryTable("AppMessage").ValuesList(&msglist, "MessageType")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "获取消息类型失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	respmsglist := make([]string, num, num)
	for i, l := range msglist {
		respmsglist[i] = l[0].(string)
	}
	c.Data["json"] = map[string]interface{}{"resp": respmsglist}
	c.ServeJSON()
}

type GetMessageDetail struct {
	beego.Controller
}

func (c *GetMessageDetail) Post() {
	msgtype := c.GetString("msgtype")
	if msgtype == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	var msgdetail []orm.ParamsList
	_, err := o.QueryTable("AppMessage").Filter("MessageType", msgtype).ValuesList(&msgdetail, "MessageContent")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "获取详细消息失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	for _, l := range msgdetail {
		c.Data["json"] = map[string]interface{}{"resp": l[0].(string)}
		c.ServeJSON()
		return
	}
}

//用户反馈目前还没编写，需要与app移动端对数据传输格式和方式进行沟通

//app管理设备接口
type ShowOwnDev struct {
	beego.Controller
}

func (c *ShowOwnDev) Post() {
	usertype := c.GetString("usertype")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	if usertype == "" || username == "" || companyname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	if usertype == "admin" {
		var resdatalist []orm.ParamsList
		num, err := o.QueryTable("FinalUserOwnDev").Filter("CompanyName", companyname).Filter("UserName", username).GroupBy("FirstDevType").ValuesList(&resdatalist, "FirstDevType")
		if err != nil {
			c.Data["json"] = map[string]string{"discb": "admin查询出错", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
		owndevtypelist := make([]interface{}, num, num)
		for i, l := range resdatalist {
			var showdevtypelist []orm.ParamsList
			data := make(map[string]string)
			_, err1 := o.QueryTable("AppMainPage").Filter("ShowDevType", l[0].(string)).ValuesList(&showdevtypelist, "DevTypeDesp")
			if err1 != nil {
				c.Data["json"] = map[string]string{"discb": "admin查询出错", "discbcss": "fail"}
				c.ServeJSON()
				return
			}
			for _, l1 := range showdevtypelist {
				data[l[0].(string)] = l1[0].(string)
			}
			owndevtypelist[i] = data
		}
		var employlist []orm.ParamsList
		num2, err2 := o.QueryTable("OperateUserInfo").Filter("CompanyName", companyname).Filter("FinalUserName", username).ValuesList(&employlist, "UserName", "PhoneNumber", "UserPassword")
		if err2 != nil {
			c.Data["json"] = map[string]string{"discb": "admin查询出错", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
		fmt.Println(employlist)
		ownemploylist := make([]interface{}, num2, num2)
		for i, l := range employlist {
			data := make(map[string]string)
			data["name"] = l[0].(string)
			data["phone"] = l[1].(string)
			data["password"] = l[2].(string)
			ownemploylist[i] = data
		}
		c.Data["json"] = map[string]interface{}{"usertype": "admin", "devtypelist": owndevtypelist, "employlist": ownemploylist}
		c.ServeJSON()
	} else if usertype == "employ" {
		var operatedevidlist []orm.ParamsList
		num, err := o.QueryTable("OperatorRelatedDev").Filter("OwnCompany", companyname).Filter("UserName", username).ValuesList(&operatedevidlist, "DevId")
		if err != nil {
			c.Data["json"] = map[string]string{"discb": "employ查询出错", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
		devidlist := make([]string, num, num)
		for i, l := range operatedevidlist {
			devidlist[i] = l[0].(string)
		}
		var i int64
		qs := o.QueryTable("FinalUserOwnDev")
		firstdevtypelist := make([]string, num, num)
		for i = 0; i < num; i++ {
			var resfirstdevtypelist []orm.ParamsList
			_, err1 := qs.Filter("DevId", devidlist[i]).ValuesList(&resfirstdevtypelist, "FirstDevType")
			if err1 != nil {
				c.Data["json"] = map[string]string{"discb": "employ查询出错", "discbcss": "fail"}
				c.ServeJSON()
				return
			}
			for _, l := range resfirstdevtypelist {
				firstdevtypelist[i] = l[0].(string)
			}
		}
		var resfirstdevlist []string
		for i = 0; i < num; i++ {
			if (i > 0 && firstdevtypelist[i-1] == firstdevtypelist[i]) || len(firstdevtypelist[i]) == 0 {
				continue
			}
			resfirstdevlist = append(resfirstdevlist, firstdevtypelist[i])
		}
		reslen := int64(len(resfirstdevlist))
		resdata := make([]interface{}, reslen, reslen)
		for i = 0; i < reslen; i++ {
			var res []orm.ParamsList
			_, err2 := o.QueryTable("AppMainPage").Filter("ShowDevType", resfirstdevlist[i]).ValuesList(&res, "DevTypeDesp")
			if err2 != nil {
				c.Data["json"] = map[string]string{"discb": "employ查询出错", "discbcss": "fail"}
				c.ServeJSON()
				return
			}
			for _, l := range res {
				data := make(map[string]string)
				data[resfirstdevlist[i]] = l[0].(string)
				resdata[i] = data
			}
		}
		c.Data["json"] = map[string]interface{}{"usertype": "employ", "devtypelist": resdata}
		c.ServeJSON()
	} else {
		c.Data["json"] = map[string]string{"discb": "usertype类型出错", "discbcss": "fail"}
		c.ServeJSON()
	}
}

type ShowOwnDevDetail struct {
	beego.Controller
}

func (c *ShowOwnDevDetail) Post() {
	usertype := c.GetString("usertype")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	firstdevtype := c.GetString("firstdevtype")
	if usertype == "" || username == "" || companyname == "" || firstdevtype == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	if usertype == "admin" {
		var subdevtypelist []orm.ParamsList
		num, err := o.QueryTable("FinalUserOwnDev").Filter("CompanyName", companyname).Filter("UserName", username).Filter("FirstDevType", firstdevtype).GroupBy("SubDevType").ValuesList(&subdevtypelist, "SubDevType")
		if err != nil {
			c.Data["json"] = map[string]string{"discb": "admin查询showowndevdetail出错", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
		subdevlist := make([]interface{}, num, num)
		//返回结果的排列顺序是由FinalUserOwnDev表中，显示的设备顺序进行排列
		for i, l := range subdevtypelist {
			var mainpagelist []orm.ParamsList
			_, err1 := o.QueryTable("AppEachDevDetail").Filter("SubDevType", l[0].(string)).ValuesList(&mainpagelist, "SubDevTypeDesp")
			if err1 != nil {
				c.Data["json"] = map[string]string{"discb": "admin查询showowndevdetail出错", "discbcss": "fail"}
				c.ServeJSON()
				return
			}
			for _, l1 := range mainpagelist {
				data := make(map[string]string)
				data[l[0].(string)] = l1[0].(string)
				subdevlist[i] = data
			}
		}
		c.Data["json"] = map[string]interface{}{"resp": subdevlist}
		c.ServeJSON()
	} else if usertype == "employ" {
		var devidlist []orm.ParamsList
		num, err := o.QueryTable("OperatorRelatedDev").Filter("OwnCompany", companyname).Filter("UserName", username).ValuesList(&devidlist, "DevId")
		if err != nil {
			c.Data["json"] = map[string]string{"discb": "employ查询showowndevdetail出错", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
		fmt.Println("-------------", devidlist)
		//获取SubDevTypeDesp
		subdevtypealllist := make([]string, num, num)
		for i, l := range devidlist {
			var ressubdevtypelist []orm.ParamsList
			_, err1 := o.QueryTable("FinalUserOwnDev").Filter("FirstDevType", firstdevtype).Filter("DevId", l[0].(string)).ValuesList(&ressubdevtypelist, "SubDevType")
			if err1 != nil {
				c.Data["json"] = map[string]string{"discb": "employ查询showowndevdetail出错", "discbcss": "fail"}
				c.ServeJSON()
				return
			}
			for _, l1 := range ressubdevtypelist {
				subdevtypealllist[i] = l1[0].(string)
			}
		}
		//给subdevtypealllist数组去重
		var subdevtypelist []string
		var i int64
		for i = 0; i < num; i++ {
			if (i > 0 && subdevtypealllist[i-1] == subdevtypealllist[i]) || len(subdevtypealllist[i]) == 0 {
				continue
			}
			subdevtypelist = append(subdevtypelist, subdevtypealllist[i])
		}
		reslen := int64(len(subdevtypelist))
		resdata := make([]interface{}, reslen, reslen)
		for i = 0; i < reslen; i++ {
			var res []orm.ParamsList
			_, err2 := o.QueryTable("AppEachDevDetail").Filter("SubDevType", subdevtypelist[i]).ValuesList(&res, "SubDevTypeDesp")
			if err2 != nil {
				c.Data["json"] = map[string]string{"discb": "employ查询showowndevdetail出错", "discbcss": "fail"}
				c.ServeJSON()
				return
			}
			for _, l := range res {
				data := make(map[string]string)
				data[subdevtypelist[i]] = l[0].(string)
				resdata[i] = data
			}
		}
		c.Data["json"] = map[string]interface{}{"resp": resdata}
		c.ServeJSON()

	} else {
		c.Data["json"] = map[string]string{"discb": "usertype类型出错", "discbcss": "fail"}
		c.ServeJSON()
	}
}

type ShowOperateDev struct {
	beego.Controller
}

//获取设备图像链接地址单独使用一个接口使用
func (c *ShowOperateDev) Post() {
	usertype := c.GetString("usertype")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	subdevtype := c.GetString("subdevtype")
	if usertype == "" || username == "" || companyname == "" || subdevtype == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	if usertype == "admin" {
		ShowOperateDevChoice("FinalUserOwnDev", "CompanyName", c, companyname, username, subdevtype)
	} else if usertype == "employ" {
		ShowEmployOperateDevChoice(c, companyname, username, subdevtype)
	} else {
		c.Data["json"] = map[string]string{"discb": "usertype类型出错", "discbcss": "fail"}
		c.ServeJSON()
	}
}

func ShowOperateDevChoice(tablename string, companynamecolume string, c *ShowOperateDev, companyname string, username string, subdevtype string) {
	o := orm.NewOrm()
	//获取缓存操作对象
	rsc := RedisClient.Get()
	defer rsc.Close()
	var resdevnamelist []orm.ParamsList
	num, err := o.QueryTable(tablename).Filter(companynamecolume, companyname).Filter("UserName", username).Filter("SubDevType", subdevtype).ValuesList(&resdevnamelist, "DevId", "DevName")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "admin查询ShowOperateDev出错", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	resdatalist := make([]interface{}, num, num)
	var key string
	var handlename string
	for i, l := range resdevnamelist {
		data := make(map[string]string)
		data["devname"] = l[1].(string)
		data["devid"] = l[0].(string)
		key = "currentoperator" + l[0].(string)
		v, err1 := redis.String(rsc.Do("get", key))
		if err1 != nil {
			handlename = ""
		} else {
			handlename = v
		}
		data["handlename"] = handlename
		resdatalist[i] = data
	}
	c.Data["json"] = map[string]interface{}{"resp": resdatalist}
	c.ServeJSON()
}

func ShowEmployOperateDevChoice(c *ShowOperateDev, companyname string, username string, subdevtype string) {
	o := orm.NewOrm()
	rsc := RedisClient.Get()
	defer rsc.Close()
	var resdevidist []orm.ParamsList
	num, err := o.QueryTable("FinalUserOwnDev").Filter("CompanyName", companyname).Filter("SubDevType", subdevtype).ValuesList(&resdevidist, "DevId", "DevName")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "employ查询ShowOperateDev出错", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	devidlist := make([]string, num, num)
	devnamelist := make([]string, num, num)
	for i, l := range resdevidist {
		devidlist[i] = l[0].(string)
		devnamelist[i] = l[1].(string)
	}
	var opresdatalist []orm.ParamsList
	num1, err1 := o.QueryTable("OperatorRelatedDev").Filter("OwnCompany", companyname).Filter("UserName", username).ValuesList(&opresdatalist, "DevId")
	if err1 != nil {
		c.Data["json"] = map[string]string{"discb": "employ查询ShowOperateDev出错", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	opdevidlist := make([]string, num1, num1)
	for i, l := range opresdatalist {
		opdevidlist[i] = l[0].(string)
	}
	var resdatalist []interface{}
	devidlen := len(devidlist)
	opdevidlen := len(opdevidlist)
	var key string
	var handlename string
	for i := 0; i < devidlen; i++ {
		for j := 0; j < opdevidlen; j++ {
			if devidlist[i] == opdevidlist[j] {
				data := make(map[string]string)
				data["devname"] = devnamelist[i]
				data["devid"] = devidlist[i]
				key = "currentoperator" + devidlist[i]
				v, err2 := redis.String(rsc.Do("get", key))
				if err2 != nil {
					handlename = ""
				} else {
					handlename = v
				}
				data["handlename"] = handlename
				resdatalist = append(resdatalist, data)
			}
		}
	}
	c.Data["json"] = map[string]interface{}{"resp": resdatalist}
	c.ServeJSON()
}

type ShowOperateDevDetail struct {
	beego.Controller
}

func (c *ShowOperateDevDetail) Post() {
	usertype := c.GetString("usertype")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	devid := c.GetString("devicecode")
	if usertype == "" || username == "" || companyname == "" || devid == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	if usertype == "admin" {
		//查询设备运行状态表
		qsdevrun := o.QueryTable("DevRunStatus")
		var devrunlist []orm.ParamsList
		var devlivelist string
		var devratelist string
		var devprocesslist string
		var devprocesslistrate string
		_, err1 := qsdevrun.Filter("DevId", devid).ValuesList(&devrunlist, "DevLive", "RateProcess", "DevProcessCode")
		if err1 == nil {
			for _, l := range devrunlist {
				devlivelist = l[0].(string)
				processdata, _ := queryprocess(l[1].(string), "DevRunCodeStatus", devid)
				devratelist = processdata
				processdata1, rate2 := queryprocess(l[2].(string), "DevProcessCodeStatus", devid)
				devprocesslist = processdata1
				devprocesslistrate = rate2
			}
		}
		//查询该设备的日工作时长，日成品数，日废品数
		qsdevcount := o.QueryTable("DevCountMsg")
		var devcountlist []orm.ParamsList
		var devworktime string
		var devdaysuc int64
		var devdayfail int64

		_, err2 := qsdevcount.Filter("DevId", devid).ValuesList(&devcountlist, "DayRunningTime", "DaySuccessedCount", "DayFailedCount", "MouthSuccessedCount", "MouthFailedCount")
		if err2 == nil {
			for _, l := range devcountlist {
				devworktime = l[0].(string)
				devdaysuc = l[1].(int64)
				devdayfail = l[2].(int64)
			}
		}
		//默认运行状态值正常为1
		numberilist := "1"

		//查询当前设备可以使用的人员设备名称
		qsRealatedDev := o.QueryTable("OperatorRelatedDev")
		var listOwnName []orm.ParamsList
		num1, err1 := qsRealatedDev.Filter("DevId", devid).Filter("OwnCompany", companyname).ValuesList(&listOwnName, "UserName")
		listnamelist := make([]string, num1, num1)
		if err1 == nil {
			for j, rowj := range listOwnName {
				listnamelist[j] = rowj[0].(string)
			}
		}

		//设备类型，出厂日期，有效期，累计工作时长，月品数，月废品数，累计成品数，累计废品数
		qsmsg := o.QueryTable("DevCountMsg")
		qsdevtotal := o.QueryTable("DevTotalMsg")
		qsdevtype := o.QueryTable("FinalUserOwnDev")
		var devmsg []orm.ParamsList
		var devtotalmsg []orm.ParamsList
		var devtype []orm.ParamsList
		_, err := qsmsg.Filter("DevId", devid).ValuesList(&devmsg, "MouthSuccessedCount", "MouthFailedCount", "DayRunningTime")
		_, err1 = qsdevtotal.Filter("DevId", devid).ValuesList(&devtotalmsg, "TotalSuccessedCount", "TotalFailedCount")
		_, err2 = qsdevtype.Filter("DevId", devid).ValuesList(&devtype, "DevType", "DevName")
		list1 := make([]interface{}, 3, 3)
		list2 := make([]int64, 2, 2)
		list3 := make([]string, 2, 2)
		if err == nil && err1 == nil && err2 == nil {
			for _, l := range devmsg {
				list1[0] = l[0].(int64)
				list1[1] = l[1].(int64)
				list1[2] = l[2].(string)
			}
			for _, l := range devtotalmsg {
				list2[0] = l[0].(int64)
				list2[1] = l[1].(int64)
			}
			for _, l := range devtype {
				list3[0] = l[0].(string)
				list3[1] = l[1].(string)
			}
		}
		c.Data["json"] = map[string]interface{}{"devtype": list3[0], "devname": list3[1], "devdeliverydate": "devdeliverydate", "devexpirydate": "devexpirydate", "devmonthsucoperatesum": list1[0],
			"devmonthfailoperatesum": list1[1], "devetotalworktime": list1[2], "devtotalsucoperatesum": list2[0], "devtotalfailoperatesum": list2[1], "devid": devid, "devicelifestatecode": devlivelist,
			"devicerunstatecode": []string{devratelist, numberilist}, "devicerunprogresscode": []string{devprocesslist, devprocesslistrate}, "devicedaysucoperatesum": devdaysuc,
			"devicedayfailoperatesum": devdayfail, "devicedayworktime": devworktime, "deviceemployename": listnamelist}
		c.ServeJSON()
	} else if usertype == "employ" {
		//查询设备运行状态表
		qsdevrun := o.QueryTable("DevRunStatus")
		var devrunlist []orm.ParamsList
		var devlivelist string
		var devratelist string
		var devprocesslist string
		var devprocesslistrate string
		_, err1 := qsdevrun.Filter("DevId", devid).ValuesList(&devrunlist, "DevLive", "RateProcess", "DevProcessCode")
		if err1 == nil {
			for _, l := range devrunlist {
				devlivelist = l[0].(string)
				processdata, _ := queryprocess(l[1].(string), "DevRunCodeStatus", devid)
				devratelist = processdata
				processdata1, rate2 := queryprocess(l[2].(string), "DevProcessCodeStatus", devid)
				devprocesslist = processdata1
				devprocesslistrate = rate2
			}
		}
		//查询该设备的日工作时长，日成品数，日废品数
		qsdevcount := o.QueryTable("DevCountMsg")
		var devcountlist []orm.ParamsList
		var devworktime string
		var devdaysuc int64
		var devdayfail int64
		var devmouthsuc int64
		var devmouthfail int64

		_, err2 := qsdevcount.Filter("DevId", devid).ValuesList(&devcountlist, "DayRunningTime", "DaySuccessedCount", "DayFailedCount", "MouthSuccessedCount", "MouthFailedCount")
		if err2 == nil {
			for _, l := range devcountlist {
				devworktime = l[0].(string)
				devdaysuc = l[1].(int64)
				devdayfail = l[2].(int64)
				devmouthsuc = l[3].(int64)
				devmouthfail = l[4].(int64)
			}
		}
		//默认运行状态值正常为1
		numberilist := "1"
		c.Data["json"] = map[string]interface{}{"devid": devid, "devicelifestatecode": devlivelist, "devicerunstatecode": []string{devratelist, numberilist}, "devicerunprogresscode": []string{devprocesslist, devprocesslistrate}, "devicedaysucoperatesum": devdaysuc,
			"devicedayfailoperatesum": devdayfail, "devicedayworktime": devworktime, "devicemouthsucoperatesum": devmouthsuc, "devicemouthfailoperatesum": devmouthfail}
		c.ServeJSON()

	} else {
		c.Data["json"] = map[string]string{"discb": "usertype类型出错", "discbcss": "fail"}
		c.ServeJSON()
	}
}

type AppDevCurControlInfo struct {
	beego.Controller
}

func (c *AppDevCurControlInfo) Post() {
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	devicecode := c.GetString("devicecode")
	if username == "" || companyname == "" || devicecode == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	qsuserown := o.QueryTable("FinalUserOwnDev")
	var devparamlist []orm.ParamsList
	_, err := qsuserown.Filter("DevId", devicecode).ValuesList(&devparamlist, "DevName", "DevType")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "AppDevCurControlInfo出错", "discbcss": "fail"}
		c.ServeJSON()
	}
	var devname string
	var devtype string
	for _, l := range devparamlist {
		devname = l[0].(string)
		devtype = l[1].(string)
	}

	rsc := RedisClient.Get()
	defer rsc.Close()

	key := "devspeed" + devicecode
	devspeed, err1 := redis.String(rsc.Do("get", key))
	if err1 != nil {
		devspeed = ""
	}
	key = "usercontrol" + devicecode
	devusercontrol, err2 := redis.String(rsc.Do("get", key))
	if err2 != nil {
		devusercontrol = ""
	}

	key = "CurrentPicAddr" + devicecode
	var curimgurl string
	curimgurl, err2 = redis.String(rsc.Do("get", key))
	if err2 != nil {
		curimgurl = ""
	}

	//设置速度等级
	key = "speedlevel"
	var speedlevel string
	speedlevel, err2 = redis.String(rsc.Do("get", key))
	if err2 != nil {
		rsc.Do("set", key, "5")
		speedlevel = "5"
	}
	//图片计算结果
	key = "devpathdata" + devicecode
	res, err2 := redis.String(rsc.Do("get", key))
	if err2 != nil {
		res = ""
	}
	//图片结果中当前执行到索引号
	key = "curProcessDsc" + devicecode
	index, err3 := redis.String(rsc.Do("get", key))
	if err3 != nil {
		index = ""
	}

	key = "currentoperator" + devicecode
	v, err := redis.String(rsc.Do("get", key))
	if err != nil {
		//取得时候此时为空
		c.Data["json"] = map[string]interface{}{"devname": devname, "devtype": devtype, "devshowtype": "see", "speedlevel": speedlevel, "curspeed": devspeed, "userctrled": devusercontrol, "curimgurl": curimgurl, "caldata": res, "pathno": index, "backimgurl": "image/1.png"}
		c.ServeJSON()
	}
	if username == v {
		c.Data["json"] = map[string]interface{}{"devname": devname, "devtype": devtype, "devshowtype": "ctrl", "speedlevel": speedlevel, "curspeed": devspeed, "userctrled": devusercontrol, "curimgurl": curimgurl, "caldata": res, "pathno": index, "backimgurl": "image/1.png"}
		c.ServeJSON()
	} else {
		c.Data["json"] = map[string]interface{}{"devname": devname, "devtype": devtype, "devshowtype": "see", "speedlevel": speedlevel, "curspeed": devspeed, "userctrled": devusercontrol, "curimgurl": curimgurl, "caldata": res, "pathno": index, "backimgurl": "image/1.png"}
		c.ServeJSON()
	}
}

type AppOperateRight struct {
	beego.Controller
}

func (c *AppOperateRight) Post() {
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	devicecode := c.GetString("devicecode")
	operatepassword := c.GetString("operatepassword")
	if username == "" || companyname == "" || devicecode == "" || operatepassword == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	//是否相同标志位
	var sameflag bool
	//查询操作密码
	o := orm.NewOrm()
	qsfinal := o.QueryTable("FinalUserInfo")
	var finallist []orm.ParamsList
	num, err := qsfinal.Filter("UserName", username).Filter("CompanyName", companyname).ValuesList(&finallist, "OperateWord")
	if num != 1 || err != nil {
		_, err = o.QueryTable("OperateUserInfo").Filter("UserName", username).Filter("CompanyName", companyname).ValuesList(&finallist, "OperateWord")
		if err == nil {
			for _, l := range finallist {
				if operatepassword == l[0] {
					sameflag = true
				} else {
					sameflag = false
				}
			}

		}
	} else {
		for _, l := range finallist {
			if operatepassword == l[0] {
				sameflag = true
			} else {
				sameflag = false
			}
		}
	}
	rsc := RedisClient.Get()
	defer rsc.Close()
	key := "currentoperator" + devicecode
	v, err2 := redis.String(rsc.Do("get", key))
	if err2 != nil && sameflag == true {
		//取得时候此时为空
		fmt.Println("devcontrolinfo err", err)
		//v1 := "操作权限从_变为_" + v + "::" + username
		//Ws.WriteJSON(v1)

		rsc.Do("set", key, username)
		c.Data["json"] = map[string]interface{}{"discb": "恭喜你获得设备操作权限！", "discbcss": "suc"}
		c.ServeJSON()

	} else if err2 == nil && sameflag == true {
		respub := make(map[string]interface{})
		respub["Devid"] = devicecode
		respub["WSSType"] = "devoperatorchangetp"
		respub["Data"] = map[string]interface{}{"newusername": username, "oldusername": v, "companyname": companyname}

		str, err3 := json.Marshal(respub)
		if err3 != nil {
			fmt.Println("respub marshal json err3", err3)
		}

		replay, err6 := rsc.Do("publish", "test1", string(str))
		if err6 != nil {
			fmt.Println("respub publish test1 err6", err6)
		}
		fmt.Println("respub test1 replay ", replay, v)
		rsc.Do("set", key, username)
		c.Data["json"] = map[string]interface{}{"discb": "恭喜你获得设备操作权限！", "discbcss": "suc"}
		c.ServeJSON()
	} else {
		c.Data["json"] = map[string]interface{}{"discb": "获取设备操作权限失败:操作密码有误！", "discbcss": "fail"}
		c.ServeJSON()
	}
}

type AppUserControlDevRun struct {
	beego.Controller
}

func (c *AppUserControlDevRun) Post() {
	devicecode := c.GetString("devicecode")
	devrun := c.GetString("devrun")
	if devicecode == "" || devrun == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	rsc := RedisClient.Get()
	defer rsc.Close()

	key := "devrun" + devicecode
	_, err1 := redis.String(rsc.Do("get", key))
	if err1 != nil {
		rsc.Do("set", key, "false")
	}
	_, err2 := rsc.Do("set", key, "true")
	if err2 == nil {
		c.Data["json"] = map[string]interface{}{"discb": "更改成功", "discbcss": "suc"}
		c.ServeJSON()
	} else {
		c.Data["json"] = map[string]interface{}{"discb": "更改失败", "discbcss": "fail"}
		c.ServeJSON()
	}
}

type AppUserControlDevPathData struct {
	beego.Controller
}

func (c *AppUserControlDevPathData) Post() {
	data := c.GetString("data")
	js, err := simplejson.NewJson([]byte(data))
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "json数据解析失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	companyname := js.Get("companyname").MustString()
	username := js.Get("username").MustString()
	devicecode := js.Get("devicecode").MustString()
	devpathdata := js.Get("devpathdata").MustString()
	if companyname == "" || username == "" || devicecode == "" || devpathdata == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	rsc := RedisClient.Get()
	defer rsc.Close()

	key := "devpathdata" + devicecode
	_, err2 := rsc.Do("set", key, devpathdata)

	if err2 == nil {
		c.Data["json"] = map[string]interface{}{"discb": "更改成功", "discbcss": "suc"}
		c.ServeJSON()
	} else {
		c.Data["json"] = map[string]interface{}{"discb": "更改失败", "discbcss": "fail"}
		c.ServeJSON()
	}

}

type AppUserControlDevSpeed struct {
	beego.Controller
}

func (c *AppUserControlDevSpeed) Post() {
	devicecode := c.GetString("devicecode")
	devspeed := c.GetString("devspeed")
	if devicecode == "" || devspeed == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	rsc := RedisClient.Get()
	defer rsc.Close()
	key := "devspeed" + devicecode
	_, err := rsc.Do("set", key, devspeed)
	if err == nil {
		c.Data["json"] = map[string]interface{}{"discb": "更改成功", "discbcss": "suc"}
		c.ServeJSON()
	} else {
		c.Data["json"] = map[string]interface{}{"discb": "更改失败", "discbcss": "fail"}
		c.ServeJSON()
	}
}

type AppUserControlDevRequest struct {
	beego.Controller
}

func (c *AppUserControlDevRequest) Post() {
	devicecode := c.GetString("devicecode")
	usercontrol := c.GetString("usercontrol")
	if devicecode == "" || usercontrol == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	rsc := RedisClient.Get()
	defer rsc.Close()
	key := "usercontrol" + devicecode
	_, err := rsc.Do("set", key, usercontrol)
	if err == nil {
		c.Data["json"] = map[string]interface{}{"discb": "更改成功", "discbcss": "suc"}
		c.ServeJSON()
	} else {
		c.Data["json"] = map[string]interface{}{"discb": "更改失败", "discbcss": "fail"}
		c.ServeJSON()
	}
}

type AppUserControlDevStopRun struct {
	beego.Controller
}

func (c *AppUserControlDevStopRun) Post() {
	devicecode := c.GetString("devicecode")
	devstoprun := c.GetString("devstoprun")
	if devicecode == "" || devstoprun == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	rsc := RedisClient.Get()
	defer rsc.Close()
	key := "devstoprun" + devicecode
	_, err := rsc.Do("set", key, devstoprun)

	if err == nil {
		c.Data["json"] = map[string]interface{}{"discb": "更改成功", "discbcss": "suc"}
		c.ServeJSON()
	} else {
		c.Data["json"] = map[string]interface{}{"discb": "更改失败", "discbcss": "fail"}
		c.ServeJSON()
	}
}

type AppAddOperatorShowAll struct {
	beego.Controller
}

func (c *AppAddOperatorShowAll) Post() {
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	if username == "" || companyname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	var resemploynamelist []orm.ParamsList
	num, err := o.QueryTable("OperateUserInfo").Filter("FinalUserName", username).Filter("CompanyName", companyname).GroupBy("UserName").ValuesList(&resemploynamelist, "UserName")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "AppAddOperatorShowAll查询失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	employnamelist := make([]string, num, num)
	for i, l := range resemploynamelist {
		employnamelist[i] = l[0].(string)
	}
	c.Data["json"] = map[string]interface{}{"resp": employnamelist}
	c.ServeJSON()
}

type AppAddOperatorChange struct {
	beego.Controller
}

//提交post参数中有数组,20161122更改为使用json格式上传数据
func (c *AppAddOperatorChange) Post() {
	/*getnamelist := c.GetString("namelist")
	  devicecode := c.GetString("devicecode")
	  username := c.GetString("username")
	  companyname := c.GetString("companyname")
	  devname := c.GetString("devname")
	  if getnamelist == "" || devicecode == "" || username == "" || companyname == "" || devname == "" {
	          c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
	          c.ServeJSON()
	          return
	  }
	  namelist, err := mashellist(getnamelist)
	  if err != nil {
	          c.Data["json"] = map[string]string{"discb": "namelist解析失败", "discbcss": "fail"}
	          c.ServeJSON()
	          return
	  }*/
	data := c.GetString("data")
	js, err := simplejson.NewJson([]byte(data))
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "json数据解析失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	devicecode := js.Get("devicecode").MustString()
	username := js.Get("username").MustString()
	companyname := js.Get("companyname").MustString()
	devname := js.Get("devname").MustString()
	namelist := js.Get("namelist").MustStringArray()
	//数组为空的情况还不能检测出来  || len(namelist) == 0
	if devicecode == "" || username == "" || companyname == "" || devname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	fmt.Println(namelist)
	o := orm.NewOrm()
	//先查询设备关联表中该设备所有关联的操作者账户
	qsrelatedv := o.QueryTable("OperatorRelatedDev")
	var knowlist []orm.ParamsList
	num, err1 := qsrelatedv.Filter("OwnCompany", companyname).Filter("FinalUserName", username).Filter("DevId", devicecode).ValuesList(&knowlist, "UserName")
	if err1 != nil {
		c.Data["json"] = map[string]string{"discb": "AppAddOperatorChange查询失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	ownlist := make([]string, num, num)
	for i, l := range knowlist {
		ownlist[i] = l[0].(string)
	}
	namelen := len(namelist)
	ownlen := len(ownlist)
	if namelen == 0 {
		for i := 0; i < ownlen; i++ {
			_, err1 = qsrelatedv.Filter("DevId", devicecode).Filter("UserName", ownlist[i]).Delete()
			if err1 != nil {
				c.Data["json"] = map[string]string{"discb": "OperatorRelatedDev删除失败", "discbcss": "fail"}
				c.ServeJSON()
				return
			}
		}
	} else {
		for i := 0; i < ownlen; i++ {
			for j := 0; j < namelen; j++ {
				if ownlist[i] == namelist[j] {
					ownlist[i] = "0"
					namelist[j] = "0"
				}
			}
		}
		//ownlist中不为"0",则要删除
		for i := 0; i < ownlen; i++ {
			if ownlist[i] != "0" {
				_, err1 = qsrelatedv.Filter("DevId", devicecode).Filter("UserName", ownlist[i]).Delete()
				if err1 != nil {
					c.Data["json"] = map[string]string{"discb": "OperatorRelatedDev删除失败", "discbcss": "fail"}
					c.ServeJSON()
					return
				}
			}
		}

		//namelist中为0的不需要添加，不为0的需要添加
		for i := 0; i < namelen; i++ {
			if namelist[i] != "0" {
				relateddev := new(models.OperatorRelatedDev)
				relateddev.UserName = namelist[i]
				relateddev.DevId = devicecode
				relateddev.DevName = devname
				relateddev.OwnCompany = companyname
				relateddev.FinalUserName = username
				_, err1 = o.Insert(relateddev)
				if err1 != nil {
					c.Data["json"] = map[string]string{"discb": "OperatorRelatedDev添加数据失败", "discbcss": "fail"}
					c.ServeJSON()
					return
				}
			}
		}
	}

	fmt.Println("ownlist namelist", ownlist, namelist)
	c.Data["json"] = map[string]interface{}{"discb": "更改成功", "discbcss": "suc"}
	c.ServeJSON()
}

//解析post中namelist的各个字符值，该解析函数废弃不用
func mashellist(v string) ([]string, error) {
	var resstring []string
	var poslist []int
	for k, l := range v {
		if l == 39 {
			poslist = append(poslist, k)
		}
	}
	if len(poslist)%2 != 0 {
		fmt.Println("namelist 解析失败")
		return nil, errors.New("namelist解析失败")
	}
	kposlist := len(poslist) / 2
	//enc := mahonia.NewEncoder("gbk")
	for j := 1; j <= kposlist; j++ {
		//strdata := enc.ConvertString(string(v[(poslist[j*2-2] + 1):poslist[j*2-1]]))
		resstring = append(resstring, string(v[(poslist[j*2-2]+1):poslist[j*2-1]]))
	}
	return resstring, nil
}

type AppGetDevImgUrl struct {
	beego.Controller
}

func (c *AppGetDevImgUrl) Get() {
	o := orm.NewOrm()
	var resdatalist []orm.ParamsList
	_, err := o.QueryTable("AppDetailProduct").ValuesList(&resdatalist, "SubDevType", "SubDevImgUrl")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "AppGetDevImgUrl查询失败失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	imgdict := make(map[string]interface{})
	for _, l := range resdatalist {
		//data := make(map[string]string)
		//data[l[0].(string)] = l[1].(string)
		imgdict[l[0].(string)] = l[1].(string)
		var resdevtypelist []orm.ParamsList
		_, err := o.QueryTable("AppEachDevDetail").Filter("SubDevType", l[0].(string)).ValuesList(&resdevtypelist, "DevType")
		if err != nil {
			c.Data["json"] = map[string]string{"discb": "AppEachDevDetail查询失败失败", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
		for _, l1 := range resdevtypelist {
			imgdict[l1[0].(string)] = l[1].(string)
		}
	}
	c.Data["json"] = map[string]interface{}{"resp": imgdict}
	c.ServeJSON()
}

type AppAdminEmployDel struct {
	beego.Controller
}

func (c *AppAdminEmployDel) Post() {
	employname := c.GetString("employname")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	if username == "" || companyname == "" || employname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	//删除相关人员信息，设备关联表信息，人员统计相关信息，设备与人员关联表信息
	o := orm.NewOrm()
	num1, err1 := o.QueryTable("OperateUserInfo").Filter("FinalUserName", username).Filter("CompanyName", companyname).Filter("UserName", employname).Delete()
	_, err2 := o.QueryTable("OperatorRelatedDev").Filter("FinalUserName", username).Filter("OwnCompany", companyname).Filter("UserName", employname).Delete()
	num3, err3 := o.QueryTable("OperatorDayMsg").Filter("FinalUserName", username).Filter("OperatorName", employname).Delete()
	if num1 != 0 && num3 != 0 && err1 == nil && err2 == nil && err3 == nil {
		c.Data["json"] = map[string]interface{}{"discb": "DelEmploy更改成功", "discbcss": "suc"}
		c.ServeJSON()
	} else {
		c.Data["json"] = map[string]interface{}{"discb": "DelEmploy更改失败", "discbcss": "fail"}
		c.ServeJSON()
	}

}

type AppAdminEmployAdd struct {
	beego.Controller
}

func (c *AppAdminEmployAdd) Post() {
	employname := c.GetString("employname")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	phonenumber := c.GetString("phonenumber")
	loginpassword := c.GetString("loginpassword")
	operatorpassword := c.GetString("operatorpassword")
	if username == "" || companyname == "" || employname == "" || phonenumber == "" || loginpassword == "" || operatorpassword == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	o.Using("default")
	//判断用户名是否重复
	num, err := o.QueryTable("OperateUserInfo").Filter("UserName", employname).Count()
	if num != 0 || err != nil {
		c.Data["json"] = map[string]interface{}{"discb": "用户名重复", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	userinfo := new(models.OperateUserInfo)
	userinfo.CompanyName = companyname
	userinfo.FinalUserName = username
	userinfo.UserName = employname
	userinfo.UserPassword = loginpassword
	userinfo.PhoneNumber = phonenumber
	userinfo.OperateWord = operatorpassword
	_, err = o.Insert(userinfo)
	if err != nil {
		c.Data["json"] = map[string]interface{}{"discb": "OperateUserInfo插入失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	//添加操作人员每月每天操作数目统计
	operdaymsg := new(models.OperatorDayMsg)
	operdaymsg.FinalUserName = username
	operdaymsg.OperatorName = employname
	_, err = o.Insert(operdaymsg)
	if err != nil {
		c.Data["json"] = map[string]interface{}{"discb": "OperatorDayMsg插入失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]interface{}{"discb": "操作成功", "discbcss": "suc"}
	c.ServeJSON()
}

type AppAdminEmployDetail struct {
	beego.Controller
}

func (c *AppAdminEmployDetail) Post() {
	employname := c.GetString("employname")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	if username == "" || companyname == "" || employname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	//查询OperateUserInfo表中该操作者信息
	o := orm.NewOrm()
	qsUserInfo := o.QueryTable("OperateUserInfo")
	var listsoperator []orm.ParamsList
	num, err := qsUserInfo.Filter("CompanyName", companyname).Filter("FinalUserName", username).Filter("UserName", employname).ValuesList(&listsoperator,
		"UserPassword", "PhoneNumber", "OperateWord")
	if num == 0 || err != nil {
		c.Data["json"] = map[string]interface{}{"discb": "OperateUserInfo查询失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	var listuserpassword, listphonenumber, listoperateword string
	for _, row := range listsoperator {
		listuserpassword = row[0].(string)
		listphonenumber = row[1].(string)
		listoperateword = row[2].(string)
	}
	qsDevName := o.QueryTable("OperatorRelatedDev")
	var listDevName []orm.ParamsList
	num1, err1 := qsDevName.Filter("OwnCompany", companyname).Filter("FinalUserName", username).Filter("UserName", employname).ValuesList(&listDevName, "DevName", "DevId")
	if err1 != nil {
		c.Data["json"] = map[string]interface{}{"discb": "OperatorRelatedDev查询失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	listnamelist := make([]string, num1, num1)
	listidlist := make([]string, num1, num1)
	for j, rowj := range listDevName {
		listnamelist[j] = rowj[0].(string)
		listidlist[j] = rowj[1].(string)
	}
	qsOperate := o.QueryTable("OperatorDayMsg")
	var listCount []orm.ParamsList
	_, err1 = qsOperate.Filter("FinalUserName", username).Filter("OperatorName", employname).ValuesList(&listCount, "DaySuccessedCount",
		"DayFailedCount", "MouthSuccessedCount", "MouthFailedCount")
	if err1 != nil {
		c.Data["json"] = map[string]interface{}{"discb": "OperatorDayMsg查询失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	var listopdaysuc, listopdayfail, listopmonthsuc, listopmonthfail int64
	var listopdayyield, listopmonthyield int64
	for _, rowj := range listCount {
		listopdaysuc = rowj[0].(int64)
		listopdayfail = rowj[1].(int64)
		listopmonthsuc = rowj[2].(int64)
		listopmonthfail = rowj[3].(int64)
		l1 := listopdaysuc
		l2 := listopdayfail
		l3 := listopmonthsuc
		l4 := listopmonthfail
		if (l1 + l2) == 0 {
			listopdayyield = 0
		} else {
			listopdayyield = l1 * 100 / (l1 + l2)
		}
		if (l3 + l4) == 0 {
			listopmonthyield = 0
		} else {
			listopmonthyield = l3 * 100 / (l3 + l4)
		}
	}
	c.Data["json"] = map[string]interface{}{"devname": listnamelist, "devid": listidlist, "phone": listphonenumber, "loginpassword": listuserpassword, "operatorpassword": listoperateword,
		"daysuccesscount": listopdaysuc, "dayfailcount": listopdayfail, "efficiency": "未计算", "daysuccessrate": listopdayyield,
		"mouthsuccesscount": listopmonthyield, "mouthfailcount": listopmonthfail, "mouthsuccessrate": listopmonthyield}
	c.ServeJSON()
}

type AppAdminEmployDevShow struct {
	beego.Controller
}

func (c *AppAdminEmployDevShow) Post() {
	employname := c.GetString("employname")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	if username == "" || companyname == "" || employname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	var resalldevidlist []orm.ParamsList
	num, err := o.QueryTable("FinalUserOwnDev").Filter("CompanyName", companyname).Filter("UserName", username).ValuesList(&resalldevidlist, "DevId", "DevName", "DevType")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "FinalUserOwnDev查询失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	alldevidlist := make([]string, num, num)
	alldevnamelist := make([]string, num, num)
	alldevtypelist := make([]string, num, num)
	for i, l := range resalldevidlist {
		alldevidlist[i] = l[0].(string)
		alldevnamelist[i] = l[1].(string)
		alldevtypelist[i] = l[2].(string)
	}
	var resopdevidlist []orm.ParamsList
	num1, err1 := o.QueryTable("OperatorRelatedDev").Filter("OwnCompany", companyname).Filter("FinalUserName", username).Filter("UserName", employname).ValuesList(&resopdevidlist, "DevId", "DevName")
	if err1 != nil {
		c.Data["json"] = map[string]string{"discb": "FinalUserOwnDev查询失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	employdevidlist := make([]string, num1, num1)
	employdevnamelist := make([]string, num1, num1)
	for i, l := range resopdevidlist {
		employdevidlist[i] = l[0].(string)
		employdevnamelist[i] = l[1].(string)
	}
	alllen := len(alldevnamelist)
	employlen := len(employdevnamelist)
	reslen := alllen - employlen
	resdevnamelist := make([]string, reslen, reslen)
	resdevidlist := make([]string, reslen, reslen)
	resdevtypelist := make([]string, reslen, reslen)
Loop:
	for i := 0; i < alllen; i++ {
		for j := 0; j < employlen; j++ {
			if alldevidlist[i] == employdevidlist[j] {
				alldevnamelist[i] = "0"
				continue Loop
			}
		}
	}
	j := 0
	for i := 0; i < alllen; i++ {
		if alldevnamelist[i] != "0" {
			resdevnamelist[j] = alldevnamelist[i]
			resdevidlist[j] = alldevidlist[i]
			resdevtypelist[j] = alldevtypelist[i]
			j++
		}
	}
	c.Data["json"] = map[string]interface{}{"namelist": resdevnamelist, "idlist": resdevidlist, "devtypelist": resdevtypelist}
	c.ServeJSON()
}

type AppAdminEmployDevAdd struct {
	beego.Controller
}

func (c *AppAdminEmployDevAdd) Post() {
	/*employname := c.GetString("employname")
	  username := c.GetString("username")
	  companyname := c.GetString("companyname")
	  getdevidlist := c.GetString("devidlist")
	  getdevnamelist := c.GetString("devnamelist")
	  if username == "" || companyname == "" || employname == "" {
	          c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
	          c.ServeJSON()
	          return
	  }
	  devidlist, err := mashellist(getdevidlist)
	  if err != nil {
	          c.Data["json"] = map[string]string{"discb": "devidlist解析失败", "discbcss": "fail"}
	          c.ServeJSON()
	          return
	  }
	  devnamelist, err1 := mashellist(getdevnamelist)
	  fmt.Println("devnamelist----------------", devnamelist)
	  if err1 != nil {
	          c.Data["json"] = map[string]string{"discb": "devidlist解析失败", "discbcss": "fail"}
	          c.ServeJSON()
	          return
	  }*/
	data := c.GetString("data")
	js, err := simplejson.NewJson([]byte(data))
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "json数据解析失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	employname := js.Get("employname").MustString()
	username := js.Get("username").MustString()
	companyname := js.Get("companyname").MustString()
	devidlist := js.Get("devidlist").MustStringArray()
	devnamelist := js.Get("devnamelist").MustStringArray()
	//数组为空的情况还不能检测出来
	if employname == "" || username == "" || companyname == "" || len(devidlist) == 0 || len(devnamelist) == 0 {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	fmt.Println(devnamelist)
	idlistlen := len(devidlist)
	//插入设备与人员相关表
	o := orm.NewOrm()
	for i := 0; i < idlistlen; i++ {
		//先判断下数据库中是否存在改账户
		num, err1 := o.QueryTable("OperatorRelatedDev").Filter("OwnCompany", companyname).Filter("FinalUserName", username).Filter("UserName", employname).Filter("DevId", devidlist[i]).Filter("DevName", devnamelist[i]).Count()
		if num == 0 && err1 == nil {
			relatedinfo := new(models.OperatorRelatedDev)
			relatedinfo.UserName = employname
			relatedinfo.DevId = devidlist[i]
			relatedinfo.DevName = devnamelist[i]
			relatedinfo.OwnCompany = companyname
			relatedinfo.FinalUserName = username
			_, err = o.Insert(relatedinfo)
			if err != nil {
				c.Data["json"] = map[string]string{"discb": "OperatorRelatedDev插入失败", "discbcss": "fail"}
				c.ServeJSON()
				return
			}
		} else {
			c.Data["json"] = map[string]string{"discb": "OperatorRelatedDev插入失败", "discbcss": "fail"}
			c.ServeJSON()
			return
		}

	}
	c.Data["json"] = map[string]interface{}{"discb": "操作成功", "discbcss": "suc"}
	c.ServeJSON()
}

type AppAdminEmployDevDel struct {
	beego.Controller
}

//此时该人员名下设备列表已经返回，只需要提交该删除后设备列表即可
func (c *AppAdminEmployDevDel) Post() {
	data := c.GetString("data")
	js, err := simplejson.NewJson([]byte(data))
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "json数据解析失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	employname := js.Get("employname").MustString()
	username := js.Get("username").MustString()
	companyname := js.Get("companyname").MustString()
	devidlist := js.Get("devidlist").MustStringArray()
	devnamelist := js.Get("devnamelist").MustStringArray()
	//数组为空的情况还不能检测出来
	if employname == "" || username == "" || companyname == "" || len(devidlist) == 0 || len(devnamelist) == 0 {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	idlen := len(devidlist)
	for i := 0; i < idlen; i++ {
		_, err = o.QueryTable("OperatorRelatedDev").Filter("OwnCompany", companyname).Filter("FinalUserName", username).Filter("UserName", employname).Filter("DevId", devidlist[i]).Filter("DevName", devnamelist[i]).Delete()
		if err != nil {
			c.Data["json"] = map[string]string{"discb": "OperatorRelatedDev删除失败", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
	}
	c.Data["json"] = map[string]interface{}{"discb": "操作成功", "discbcss": "suc"}
	c.ServeJSON()
}

type AppAdminEmployMsgEdit struct {
	beego.Controller
}

func (c *AppAdminEmployMsgEdit) Post() {
	employname := c.GetString("employname")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	loginpassword := c.GetString("loginpassword")
	operatorpassword := c.GetString("operatorpassword")
	devmounthsuccount := c.GetString("devmounthsuccount")
	devmounthfailcount := c.GetString("devmounthfailcount")
	if username == "" || companyname == "" || employname == "" || loginpassword == "" || operatorpassword == "" || devmounthsuccount == "" || devmounthfailcount == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	_, err := o.QueryTable("OperateUserInfo").Filter("CompanyName", companyname).Filter("FinalUserName", username).Filter("UserName", employname).Update(orm.Params{"UserPassword": loginpassword, "OperateWord": operatorpassword})
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "OperateUserInfo更新失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	_, err = o.QueryTable("OperatorDayMsg").Filter("FinalUserName", username).Filter("OperatorName", employname).Update(orm.Params{"MouthSuccessedCount": devmounthsuccount, "MouthFailedCount": devmounthfailcount})
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "OperatorDayMsg更新失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]interface{}{"discb": "操作成功", "discbcss": "suc"}
	c.ServeJSON()
}

type AppChangePassword struct {
	beego.Controller
}

func (c *AppChangePassword) Post() {
	usertype := c.GetString("usertype")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	oldpassword := c.GetString("oldpassword")
	newpassword := c.GetString("newpassword")
	if username == "" || companyname == "" || oldpassword == "" || newpassword == "" || usertype == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm()
	if usertype == "admin" {
		qs := o.QueryTable("FinalUserInfo").Filter("CompanyName", companyname).Filter("UserName", username)
		num, err := qs.Filter("UserPassword", oldpassword).Count()
		if num == 1 && err == nil {
			_, err = qs.Update(orm.Params{"UserPassword": newpassword})
			if err != nil {
				c.Data["json"] = map[string]string{"discb": "FinalUserInfo更新错误", "discbcss": "fail"}
				c.ServeJSON()
				return
			}
			c.Data["json"] = map[string]interface{}{"discb": "操作成功", "discbcss": "suc"}
			c.ServeJSON()
		} else {
			c.Data["json"] = map[string]string{"discb": "提交oldpassword错误", "discbcss": "fail"}
			c.ServeJSON()
		}
	} else if usertype == "employ" {
		qs := o.QueryTable("OperateUserInfo").Filter("CompanyName", companyname).Filter("UserName", username)
		num, err := qs.Filter("UserPassword", oldpassword).Count()
		if num == 1 && err == nil {
			_, err = qs.Update(orm.Params{"UserPassword": newpassword})
			if err != nil {
				c.Data["json"] = map[string]string{"discb": "OperateUserInfo更新错误", "discbcss": "fail"}
				c.ServeJSON()
				return
			}
			c.Data["json"] = map[string]interface{}{"discb": "操作成功", "discbcss": "suc"}
			c.ServeJSON()
		} else {
			c.Data["json"] = map[string]string{"discb": "提交oldpassword错误", "discbcss": "fail"}
			c.ServeJSON()
		}
	} else if usertype == "visitor" {
		qs := o.QueryTable("VistorToRegister").Filter("CompanyName", companyname).Filter("UserName", username)
		num, err := qs.Filter("Password", oldpassword).Count()
		if num == 1 && err == nil {
			_, err = qs.Update(orm.Params{"Password": newpassword})
			if err != nil {
				c.Data["json"] = map[string]string{"discb": "OperateUserInfo更新错误", "discbcss": "fail"}
				c.ServeJSON()
				return
			}
			c.Data["json"] = map[string]interface{}{"discb": "操作成功", "discbcss": "suc"}
			c.ServeJSON()
		} else {
			c.Data["json"] = map[string]string{"discb": "提交oldpassword错误", "discbcss": "fail"}
			c.ServeJSON()
		}
	} else {
		c.Data["json"] = map[string]string{"discb": "usertype类型有误", "discbcss": "fail"}
		c.ServeJSON()
	}

}

type AppAddHeadPic struct {
	beego.Controller
}

func (c *AppAddHeadPic) Post() {
	usertype := c.GetString("usertype")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	//picture := c.GetString("picture")
	if usertype == "" || username == "" || companyname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	_, h, err := c.GetFile("picture")
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "获取图片失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	filename := h.Filename
	o := orm.NewOrm()
	if usertype == "admin" {
		SaveUploadHeadPic("FinalUserInfo", o, companyname, username, c, filename)
	} else if usertype == "employ" {
		SaveUploadHeadPic("OperateUserInfo", o, companyname, username, c, filename)
	} else if usertype == "visitor" {
		SaveUploadHeadPic("VistorToRegister", o, companyname, username, c, filename)
	} else {
		c.Data["json"] = map[string]string{"discb": "usertype类型有误", "discbcss": "fail"}
		c.ServeJSON()
	}
}

func SaveUploadHeadPic(tablename string, o orm.Ormer, companyname string, username string, c *AppAddHeadPic, filename string) {
	qs := o.QueryTable(tablename).Filter("CompanyName", companyname).Filter("UserName", username)
	t := int(time.Now().Unix())
	tstring := strconv.Itoa(t)
	num, err := qs.Count()
	if num == 1 && err == nil {
		path := tstring + "_" + filename
		c.SaveToFile("picture", path)
		_, err = qs.Update(orm.Params{"AccountPicture": path})
		if err != nil {
			c.Data["json"] = map[string]string{"discb": "图片插入失败", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
		c.Data["json"] = map[string]string{"discb": "图片插入成功", "discbcss": "suc"}
		c.ServeJSON()
	} else {
		c.Data["json"] = map[string]string{"discb": "图片插入失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
}

type AppResetPasswordPost struct {
	beego.Controller
}

func (c *AppResetPasswordPost) Post() {
	companyname := c.GetString("companyname", "1")
	username := c.GetString("username", "1")
	phonenumber := c.GetString("phonenumber", "1")
	fmt.Println("companyname  username phonenumber----------:", companyname, username, phonenumber)
	if k := UtilCheck("1", companyname, username, phonenumber); k == false {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	//数据库查询获得的值
	c.SetSession("appusername", username)
	c.SetSession("appcompanyname", companyname)
	c.SetSession("appphonenumber", phonenumber)
	var storewhichtable string
	final := QueryCheck(companyname, username, phonenumber, "FinalUserInfo")
	operate := QueryCheck(companyname, username, phonenumber, "OperateUserInfo")
	visit := QueryCheck(companyname, username, phonenumber, "VistorToRegister")
	if final == true || operate == true || visit == true {
		if final == true && operate == false && visit == false {
			storewhichtable = "FinalUserInfo"
		} else if final == false && operate == true && visit == false {
			storewhichtable = "OperateUserInfo"
		} else if final == false && operate == false && visit == true {
			storewhichtable = "VistorToRegister"
		}
		fmt.Println("+++", storewhichtable)
		c.SetSession("appStoreWhichTable", storewhichtable)
		c.Data["json"] = map[string]string{"discb": "成功", "discbcss": "suc"}
		c.ServeJSON()
		return
	}
	//c.Data["msg"] = "用户名密码手机号错误"
	c.Data["json"] = map[string]string{"discb": "用户名密码手机号错误", "discbcss": "fail"}
	c.ServeJSON()
	return
}

type AppResetCheck struct {
	beego.Controller
}

func (c *AppResetCheck) Post() {
	storename := c.GetSession("appusername").(string)
	if len(storename) == 0 {
		c.Data["json"] = map[string]string{"discb": "session参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	resetpassword := c.GetString("resetpassword", "1")
	resetcheck := c.GetString("resetcheck", "1")
	fmt.Println("===============resetpassword,,resetcheck:", resetpassword, resetcheck)
	if k := UtilCheck("1", resetpassword, resetcheck); k == false {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	if resetcheck == resetpassword {
		stroephonenumber := c.GetSession("appphonenumber").(string)
		storewhichtable := c.GetSession("appStoreWhichTable").(string)
		var err bool
		if storewhichtable == "VistorToRegister" {
			err = UpdatePasswordVisit(storewhichtable, storename, stroephonenumber, resetpassword)
		} else {
			err = UpdatePassword(storewhichtable, storename, stroephonenumber, resetpassword)
		}

		if err == true {
			//c.Data["msg"] = "ok" + StoreName
			//c.TplName = "forgetpasswordfinished.html"
			c.Data["json"] = map[string]string{"discb": "成功", "discbcss": "suc"}
			c.ServeJSON()
			return
		} else {
			//c.Data["msg"] = "插入失败"
			//c.TplName = "forgetpasswordreset.html"
			c.Data["json"] = map[string]string{"discb": "插入失败", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
	} else {
		//c.Data["msg"] = "false" + StoreName
		//c.TplName = "forgetpasswordverify.html"
		//c.TplName = "forgetpasswordreset.html"
		c.Data["json"] = map[string]string{"discb": "插入失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
}

func UpdatePasswordVisit(table string, username string, phonenumber string, resetpassword string) bool {
	o := orm.NewOrm()
	_, err := o.QueryTable(table).Filter("UserName", username).Filter("PhoneNumber", phonenumber).Update(orm.Params{"Password": resetpassword})
	if err == nil {
		return true
	} else {
		return false
	}
}

type AppGetVersion struct {
	beego.Controller
}

func (c *AppGetVersion) Get() {
	path := "appversion.json"
	resdata, err := ioutil.ReadFile(path)
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "readfile失败", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]string{"version": string(resdata)}
	c.ServeJSON()
}

type AppUpdate struct {
	beego.Controller
}

func (c *AppUpdate) Get() {
	version := c.GetString("version")
	if version == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	path := version + "/WWClientAd.apk"
	c.Ctx.Output.Download(path)
}

//该接口仅供测试使用
type PostListTest struct {
	beego.Controller
}

func (c *PostListTest) Post() {
	/*getnamelist := c.GetString("namelist")
	  name := c.GetString("name")
	  fmt.Println(name)
	  namelist := query(getnamelist)
	  fmt.Println(namelist)
	  enc := mahonia.NewEncoder("utf-8")
	  fmt.Println("mahonia--------", enc.ConvertString(namelist[0]))
	  namelist1, _ := mashellist(getnamelist)
	  s := "\"" + namelist1[0] + "\""
	  fmt.Println(s)
	  fmt.Println("mahonia--------", enc.ConvertString(s))
	  c.Data["json"] = map[string]interface{}{"resp": "ok"}
	  c.ServeJSON()*/
	//getnamelist1 := c.GetString("namelist1")
	//getnamelist2 := c.GetString("namelist2")
	data := c.GetString("data")
	js, err := simplejson.NewJson([]byte(data))
	if err != nil {
		panic(err.Error())
	}
	namelist1 := js.Get("namelist2").MustStringArray()
	fmt.Println(namelist1)
	c.Data["json"] = map[string]interface{}{"resp": "ok"}
	c.ServeJSON()
}

type IosImgTest struct {
	beego.Controller
}

func (c *IosImgTest) Post() {
	usertype := c.GetString("usertype")
	username := c.GetString("username")
	companyname := c.GetString("companyname")
	picturetotal, _ := c.GetInt("picturetotal")

	//picture := c.GetString("picture")
	fmt.Println("-------------===========", usertype, username, companyname)
	if usertype == "" || username == "" || companyname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	fmt.Println("###########", picturetotal)
	for i := 0; i < picturetotal; i++ {
		picflag := "picture" + strconv.Itoa(i)
		_, h, err := c.GetFile(picflag)
		fmt.Println("#########################h.filename", h.Filename)
		if err != nil {
			c.Data["json"] = map[string]string{"discb": "获取图片失败", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
		t := int(time.Now().Unix())
		tstring := strconv.Itoa(t)
		path := tstring + "_" + h.Filename
		c.SaveToFile(picflag, path)
	}
	c.Data["json"] = map[string]string{"discb": "图片插入成功", "discbcss": "suc"}
	c.ServeJSON()
}
