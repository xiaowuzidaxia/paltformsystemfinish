package controllers

import (
	"fmt"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	//"github.com/garyburd/redigo/redis"
	"github.com/gorilla/websocket"
	"time"
)

type Echo struct {
	beego.Controller
}

//var Ws *websocket.Conn

var DevidWsmap map[string]map[int64]*websocket.Conn

func (c *Echo) Get() {

	//Ws, _ = websocket.Upgrade(c.Ctx.ResponseWriter, c.Ctx.Request, nil, 1024, 1024)

	name := c.GetSession("username").(string)
	companyname := c.GetSession("companyname").(string)

	Ws1, _ := websocket.Upgrade(c.Ctx.ResponseWriter, c.Ctx.Request, nil, 1024, 1024)

	o := orm.NewOrm()
	qsfinaluserown := o.QueryTable("FinalUserOwnDev")
	var devlist []orm.ParamsList
	num, err := qsfinaluserown.Filter("CompanyName", companyname).Filter("UserName", name).ValuesList(&devlist, "DevId")
	if err == nil && num != 0 {
		for _, l := range devlist {
			//DevidWsmap[l[0].(string)] = Ws1

			boolres := qeurydevidisexit(l[0].(string))

			if boolres == false {
				DevidWsmap[l[0].(string)] = make(map[int64]*websocket.Conn)
			}
			t := time.Now().Unix()
			DevidWsmap[l[0].(string)][t] = Ws1
		}
	} else {
		_, err = o.QueryTable("OperatorRelatedDev").Filter("OwnCompany", companyname).Filter("UserName", name).ValuesList(&devlist, "DevId")
		if err == nil {
			for _, l := range devlist {
				//DevidWsmap[l[0].(string)] = Ws1

				boolres := qeurydevidisexit(l[0].(string))

				if boolres == false {
					DevidWsmap[l[0].(string)] = make(map[int64]*websocket.Conn)
				}
				t := time.Now().Unix()
				DevidWsmap[l[0].(string)][t] = Ws1
			}
		}

	}

	//DevidWsmap["20161001"] = Ws1
	//DevidWsmap["20161002"] = Ws1
	//DevidWsmap["20161003"] = Ws1
	fmt.Println("连接用户名", name)
	fmt.Println("连接手机号对应的长连接对象", DevidWsmap)

	for {
		messagetype, p, err := Ws1.ReadMessage()
		if err != nil {
			return
		}
		Ws1.WriteMessage(1, []byte("wuzi1"))
		fmt.Println("--------------->>>>>>>>", string(p), messagetype, Ws1)
	}
}

func qeurydevidisexit(devid string) bool {
	for k, _ := range DevidWsmap {
		if k == devid {
			return true
		}
	}
	return false
}

type AppEcho struct {
	beego.Controller
}

func (c *AppEcho) Post() {
	name := c.GetString("username")
	companyname := c.GetString("companyname")
	Ws1, _ := websocket.Upgrade(c.Ctx.ResponseWriter, c.Ctx.Request, nil, 1024, 1024)
	o := orm.NewOrm()
	qsfinaluserown := o.QueryTable("FinalUserOwnDev")
	var devlist []orm.ParamsList
	num, err := qsfinaluserown.Filter("CompanyName", companyname).Filter("UserName", name).ValuesList(&devlist, "DevId")
	if err == nil && num != 0 {
		for _, l := range devlist {
			//DevidWsmap[l[0].(string)] = Ws1

			boolres := qeurydevidisexit(l[0].(string))

			if boolres == false {
				DevidWsmap[l[0].(string)] = make(map[int64]*websocket.Conn)
			}
			t := time.Now().Unix()
			DevidWsmap[l[0].(string)][t] = Ws1
		}
	} else {
		_, err = o.QueryTable("OperatorRelatedDev").Filter("OwnCompany", companyname).Filter("UserName", name).ValuesList(&devlist, "DevId")
		if err == nil {
			for _, l := range devlist {
				//DevidWsmap[l[0].(string)] = Ws1

				boolres := qeurydevidisexit(l[0].(string))

				if boolres == false {
					DevidWsmap[l[0].(string)] = make(map[int64]*websocket.Conn)
				}
				t := time.Now().Unix()
				DevidWsmap[l[0].(string)][t] = Ws1
			}
		}

	}
}

type Echo1 struct {
	beego.Controller
}

func (c *Echo1) Get() {
	Ws2, _ := websocket.Upgrade(c.Ctx.ResponseWriter, c.Ctx.Request, nil, 1024, 1024)
	for {
		messagetype, p, err := Ws2.ReadMessage()
		if err != nil {
			return
		}
		Ws2.WriteMessage(1, []byte("wuzi1"))
		fmt.Println("--------------->>>>>>>>", string(p), messagetype, Ws2)
	}

}
