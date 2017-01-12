package models

import (
//"github.com/astaxie/beego/orm"

//"time"
)

/*
type User struct {
	Id    int
	Name  string
	Phone string
}
type Money struct {
	Id        int
	Money     string
	TopicTime time.Time `orm:"auto_now_add,type(datetime)"`
}
*/

type FinalUserInfo struct {
	Id           int
	UserName     string
	UserPassword string
	CompanyName  string
	Email        string
	DevNumber    int
}

type OperateUserInfo struct {
	Id           int
	CompanyName  string
	UserName     string
	UserPassword string
}
