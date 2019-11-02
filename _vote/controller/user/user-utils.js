const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')

const config = require('../../config')
const codeCache = require('../../models/code_cache')
const tokenCache = require('../../models/token_cache')

function createCode() {
    var num = "";
    for (let i = 0; i < 6; i++) {
        num += Math.floor(Math.random() * 10);
    }
    return num;
}

function newToken(email, pwd) {
    return new Promise((resolve, reject) => {
        let payload = {
            email: email,
            pwd: pwd,
            isLogin: true,
            create_ts: Date.now(),
            expired_ts: Date.now() +  60 * 60 * 1000 // 令牌过期时间一小时
        }
        tokenCache.findOne({email: email}).exec(async (err, tokenResult) => {
            if(err) reject(err)
            if(!tokenResult) {
                let newToken = new tokenCache({
                    email: email,
                    pwd: pwd,
                    isLogin: payload.isLogin,
                    create_ts: payload.create_ts,
                    expired_ts: payload.expired_ts
                })
                try {
                    await newToken.save()
                } catch (err) {
                    reject(err)
                }
                resolve(jwt.sign(payload, config.token_key))
            } else {
                tokenResult.isLogin = payload.isLogin
                tokenResult.create_ts = payload.create_ts
                tokenResult.expired_ts = payload.expired_ts
                try {
                    await tokenResult.save()
                } catch (err) {
                    reject(err)
                }
                resolve(jwt.sign(payload, config.token_key))
            }
            
        })
    })
}

class Mail {
    constructor(email, code) {
        this.mail = {
            from: '969284250@qq.com',
            subject: '用户验证码',
            to: email,
            text: '您的验证码为' + code
        }
    }

    send() {
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport(config.mail)
            transporter.sendMail(this.mail, function (err, rt) {
                if (err) {
                    reject(err)
                } else {
                    console.log('mail sent successed:', rt.response)
                    resolve(rt)
                }
            })
        })
    }
}

module.exports = {
    createCode,
    newToken,
    Mail
}