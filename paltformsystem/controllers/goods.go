package controllers

import (
	//"fmt"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	//"paltformsystem/paltformsystem/models"
	//"crypto/md5"
	//"encoding/hex"
	//"encoding/json"
	//"github.com/astaxie/beego/cache"
	//_ "github.com/astaxie/beego/cache/redis"
	//"github.com/bitly/go-simplejson"
	"github.com/garyburd/redigo/redis"
	//"paltformsystem/paltformsystem/models"
)

type GoodsLogin struct {
	beego.Controller
}

func (c *GoodsLogin) Post() {
	devid := c.GetString("devid")
	username := c.GetString("username")
	password := c.GetString("password")
	companyname := c.GetString("companyname")
	if devid == "" || username == "" || password == "" || companyname == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	o := orm.NewOrm() //FinalUserInfo
	num, err := o.QueryTable("FinalUserInfo").Filter("UserName", username).Filter("UserPassword", password).Filter("CompanyName", companyname).Count()
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "FinalUserInfo查询出错", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	if num == 1 {
		num, err := o.QueryTable("FinalUserOwnDev").Filter("UserName", username).Filter("CompanyName", companyname).Filter("devid", devid).Filter("SubDevType", "15p3").Count()
		if err != nil {
			c.Data["json"] = map[string]string{"discb": "FinalUserOwnDev查询出错", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
		if num == 1 {
			c.Data["json"] = map[string]string{"discb": "10000", "discbcss": "suc"}
			c.ServeJSON()
			return
		}
	}
	num, err = o.QueryTable("OperateUserInfo").Filter("UserName", username).Filter("UserPassword", password).Filter("CompanyName", companyname).Count()
	if err != nil {
		c.Data["json"] = map[string]string{"discb": "OperateUserInfo查询出错", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	if num == 1 {
		num, err = o.QueryTable("OperatorRelatedDev").Filter("OwnCompany", companyname).Filter("UserName", username).Filter("DevId", devid).Count()
		if err != nil {
			c.Data["json"] = map[string]string{"discb": "OperatorRelatedDev查询出错", "discbcss": "fail"}
			c.ServeJSON()
			return
		}
		if num == 1 {
			c.Data["json"] = map[string]string{"discb": "10000", "discbcss": "suc"}
			c.ServeJSON()
			return
		}
	}
	c.Data["json"] = map[string]string{"discb": "login出错", "discbcss": "fail"}
	c.ServeJSON()
	return
}

type GoodsDetail struct {
	beego.Controller
}

func (c *GoodsDetail) Post() {
	devid := c.GetString("devid")
	if devid == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}
	rsc := RedisClient.Get()
	defer rsc.Close()

	key := "goodsresult" + devid
	goodsresult, err := redis.String(rsc.Do("get", key))
	if err != nil {
		goodsresult = ""
	}
	c.Data["json"] = map[string]interface{}{"resp": goodsresult}
	c.ServeJSON()
	return
}

type PostGoodsDetail struct {
	beego.Controller
}

func (c *PostGoodsDetail) Post() {
	devid := c.GetString("devid")
	result := c.GetString("result")
	if devid == "" || result == "" {
		c.Data["json"] = map[string]string{"discb": "提交参数中有空", "discbcss": "fail"}
		c.ServeJSON()
		return
	}

	rsc := RedisClient.Get()
	defer rsc.Close()

	key := "goodsresult" + devid
	rsc.Do("set", key, result)
	c.Data["json"] = map[string]string{"discb": "添加数据成功", "discbcss": "suc"}
	c.ServeJSON()
	return
}
