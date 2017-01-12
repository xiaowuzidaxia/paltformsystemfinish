package routers

import (
	"github.com/astaxie/beego"
	"paltformsystem/paltformsystem/controllers"
)

func init() {
	beego.Router("/", &controllers.MainController{})
	beego.Router("/uishow/", &controllers.UiShowControl{})
	beego.Router("/deletesession/", &controllers.DeleteSessionControl{})
}
