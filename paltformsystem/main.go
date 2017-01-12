package main

import (
	"fmt"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/context"
	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
	"net/url"
	"paltformsystem/paltformsystem/models"
	_ "paltformsystem/paltformsystem/routers"
	"time"
)

func init() {
	orm.RegisterModel(new(models.FinalUserInfo), new(models.OperateUserInfo))
	orm.RegisterDriver("mysql", orm.DRMySQL)
	orm.DefaultTimeLoc, _ = time.LoadLocation("Asia/Shanghai")
	dns := fmt.Sprintf("root:123456@/default?charset=utf8&loc=%s", url.QueryEscape("Asia/Shanghai"))
	orm.RegisterDataBase("default", "mysql", dns)
}

func main() {
	orm.Debug = true
	orm.RunSyncdb("default", false, true)
	beego.SetStaticPath("/down", "down")
	beego.BConfig.WebConfig.Session.SessionCookieLifeTime = 3800
	beego.BConfig.WebConfig.Session.SessionProvider = "file"
	beego.BConfig.WebConfig.Session.SessionProviderConfig = "./tmp"

	var FilterUser = func(ctx *context.Context) {
		a, ok := ctx.Input.Session("islogin").(bool)
		if !ok && ctx.Request.RequestURI != "/" && ctx.Request.RequestURI != "/uishow/" {
			fmt.Println("filter work", a)
			ctx.Redirect(302, "/")

		} else {
			fmt.Println("filter ok", a)
		}
	}

	beego.InsertFilter("/*", beego.BeforeRouter, FilterUser)
	beego.SetStaticPath("/static", "static")
	beego.Run()
}
