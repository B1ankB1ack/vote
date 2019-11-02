const express = require('express')
const router = express.Router()
const user = require('../controller/user')

router.post('/email', user.email) //发送验证码
router.post('/signup', user.signup) //注册
router.post('/login', user.login) //登录
router.post('/logout', user.logout) //登出
router.post('/change_pwd', user.changePwd) // 修改密码

module.exports = router