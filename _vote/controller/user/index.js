const jwt = require('jsonwebtoken')
const utils = require('./user-utils')
const user = require('../../models/user')
const codeCache = require('../../models/code_cache')
const tokenCache = require('../../models/token_cache')
const config = require('../../config')

// 向邮箱发送验证码
async function email(req, res, next) {

    let email = req.body.email
    let reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
    let judge = reg.test(email)
    let code = await utils.createCode()
    let mail = new utils.Mail(email, code)

    // 验证是否漏参及参数格式
    if (!email) return res.json({ success: false, message: '邮箱不能为空' })
    if(!judge) return res.json({ success: false, message: '邮箱格式不对' })
    
    // 更新/新增缓存验证码
    codeCache.findOne({ email: email }).exec(async (err, cacheResult) => {
        if(err) {
            return res.json({ success: false, message: '查询缓存验证码失败', err: err })
        } 
        else if(!cacheResult) 
        {
            let newCache = new codeCache({
                email: email,
                code: code
            })
            try {
                await newCache.save()
            } catch (err) {
                return res.json({ succfalses: false, message: '验证码保存失败', err: err })
            }

            // 发送验证码
            try {
                await mail.send()
            } catch (err) {
                return res.json({ succfalses: false, message: '验证码发送失败', err: err })
            }
            return res.json({ success: true, message: '验证码已发送' })
        } 
        else if((Date.now() - cacheResult.update_ts) > 60000) 
        { // 一分钟内不可重复发送
            cacheResult.code = code
            cacheResult.update_ts = Date.now()
            try {
                await cacheResult.save()
            } catch (err) {
                return res.json({ success: false, message: '验证码保存失败', err: err })
            }
            
            // 发送验证码
            try {
                await mail.send()
            } catch (err) {
                return res.json({ success: false, message: '验证码发送失败', err: err })
            }
            return res.json({ success: true, message: '验证码已发送' })
        } 
        else 
        {
            return res.json({ success: false, message: '请勿在一分钟内重复发送验证码' })        
        }
    })
}

// 注册用户
function signup(req, res, next) {
    let email = req.body.email
    let pwd = req.body.pwd
    let repwd = req.body.repwd
    let code = req.body.code

    // 验证是否漏参及参数格式
    if(!(email && pwd && repwd && code)) return res.json({ success: false, message: '缺少参数'})
    if(pwd !== repwd) return res.json({ success: false, message: '两次输入密码不一致'})

    // 验证邮箱是否被已注册
    user.findOne({ email: email }).exec((err, userResult) => {
        if(err) return res.json({ success: false, message: '查询用户失败', err: err })
        if(userResult) return res.json({ success: false, message: '该邮箱已经注册' })
        
        // 验证已发送验证码
        codeCache.findOne({email :email }).exec(async (err, cacheResult) => {
            if(err) return res.json({ success: false, message: '查询缓存验证码失败', err: err })
            if(!cacheResult) return res.json({ success: false, message: '该邮箱尚未获取验证码'})
            if((Date.now() - cacheResult.update_ts) > 300000) { // 验证验证码是否过期(设置过期时间为5分钟)
                return res.json({ success: false, message: '验证码已过期，请重新发送验证码'})
            }
            if(code !== cacheResult.code) return res.json({success: false, message: '验证码错误'})

            // 储存用户资料
            let newUser = new user({
                email: email,
                pwd: pwd,
                candidate: []
            })
            try {
                await newUser.save()
            } catch (err) {
                return res.json({ success: false, message: '用户信息保存失败', err: err })
            }
            return res.json({ success: true, message: '注册成功' })
        })
    })
}

// 用户登录
function login(req, res, next) {
    let email = req.body.email
    let pwd = req.body.pwd

    // 验证是否漏参及参数格式
    if(!(email && pwd)) return res.json({ success: false, message: '缺少参数'})

    // 验证用户信息
    user.findOne({email: email}).exec(async (err, userResult) => {
        if(err) return res.json({success: false, message: '查询用户邮箱失败', err: err})
        if(!userResult) return res.json({success: false, message: '该邮箱尚未注册'})
        if(userResult.pwd !== pwd) return res.json({success: false, message: '密码不正确'})
        
        // 生成jwt令牌
        let token
        try {
            token = await utils.newToken(email, pwd)
        } catch (err) {
            return res.json({success: false, message: 'token缓存失败', err: err})
        }
        return res.json({success: true, message: '登录成功', token: token})
    })
}

// 用户登出
function logout(req, res, next) {
    let email = req.body.email
    
   // 验证是否漏参及参数格式
    if(!(email)) return res.json({ success: false, message: '缺少参数'})

    tokenCache.findOne({email: email}).exec(async (err,tokenResult) => {
        if(err) return res.json({success: false, message: '令牌查询失败', err: err})
        if(!tokenResult) return res.json({success: false, message: '用户尚未登录'})
        tokenResult.isLogin = false
        try {
            await tokenResult.save()
        } catch (err) {
            return res.json({success: false, message: '登出信息保存失败', err: err})
        }
        return res.json({success: true, message: '登出成功'})
    })
}

// 修改密码
async function changePwd(req, res, next) {
    let email = req.body.email
    let pwd = req.body.pwd
    let repwd = req.body.repwd
    let code = req.body.code

    // 验证是否漏参及参数格式
    if(!(email && pwd && repwd && code)) return res.json({ success: false, message: '缺少参数'})
    if(pwd !== repwd) return res.json({ success: false, message: '两次输入密码不一致'})

    // 检查邮箱是否注册
    user.findOne({ email: email }).exec((err, userResult) => {
        if(err) return res.json({ success: false, message: '查询用户失败', err: err })
        if(!userResult) return res.json({ success: false, message: '该邮箱尚未注册' })
        
        // 验证已发送验证码
        codeCache.findOne({email :email }).exec(async (err, cacheResult) => {
            if(err) return res.json({ success: false, message: '查询缓存验证码失败', err: err })
            if(!cacheResult) return res.json({ success: false, message: '用户尚未获取验证码'})
            if((Date.now() - cacheResult.update_ts) > 300000) { // 验证验证码是否过期(设置过期时间为5分钟)
                return res.json({ success: false, message: '验证码已过期，请重新发送验证码'})
            }
            if(code !== cacheResult.code) return res.json({success: false, message: '验证码错误'})

            // 修改密码
            userResult.pwd = pwd
            try {
                await userResult.save()
            } catch (err) {
                return res.json({ success: false, message: '用户信息保存失败', err: err })
            }
            return res.json({ success: true, message: '密码修改成功' })
        })
    })
}

module.exports = {
    email,
    signup,
    login,
    logout,
    changePwd
}