const config = require('../config')
const jwt = require('jsonwebtoken')
const tokenCache = require('../models/token_cache')
const user = require('../models/user')

exports.checkToken = (req, res, next) => {
    let token = req.headers.authorization
    try {
        var payload = jwt.verify(token, config.token_key)
    } catch (err) {
        return res.json({ success: false, message: '令牌解析失败', err: err })
    }
    tokenCache.findOne({email: payload.email}).exec((err, tokenResult) => {
        if(err) return res.json({ success: false, message: '令牌查询失败', err: err })
        if(!tokenResult) return res.json({ success: false, message: '令牌无效' })
        if(payload.pwd !== tokenResult.pwd) return res.json({ success: false, message: '令牌密码无效' })
        if(Date.now() > payload.expired_ts) return res.json({ success: false, message: '令牌已过期' })
        if(!tokenResult.isLogin) return res.json({ success: false, message: '用户已登出，请重新登陆' })
        req.token = tokenResult
        return next()
    })
}

exports.checkAdmin = (req, res, next) => {
    let email = req.token.email
    user.findOne({email: email}).exec((err, userResult) => {
        if(!userResult.isAdmin) return res.json({ success: false, message: '该用户无管理员权限' })
        next()
    })

}

exports.checkStatus = async (req, res, next) => {
    await user.findOne({isAdmin: true}).exec((err, admin) => {
        if(err) return res.json({success: false, message: '查询管理员Status失败', err: err})
        if(!admin) return res.json({success: false, message: '无管理员账户'})
        req.voteStatus = admin.status
        next()
    })
}