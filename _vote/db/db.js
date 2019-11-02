const mongoose = require('mongoose');
const user = require('../models/user')
const config = require('../config')

// Database constants
let db = config.db
mongoose.connect(`mongodb://${ db.user }:${ db.pwd }@${ db.host }:${ db.port }/${ db.database }?authSource=${ db.auth }`, async (err) => {
    if(err) return console.log('Database Connection Error : ', err)
    console.log('Database Connected')
    let admin = new user({
        email: config.admin.email,
        pwd: config.admin.pwd,
        isAdmin: true,
        status: false
    })
    // 检查是否已有管理员帐号,如有，则删除，并新建管理员帐号
    user.findOne({isAdmin: true}).exec(async (err, userResult) => {
        if(err) return console.log('Failed to Find User:admin in Database. Error : ', err)
        if(userResult) {
            await user.deleteOne({isAdmin: true}, (err) => {
                if(err) return console.log('Failed to Delete User:admin. Error : ', err)
            })
        }
        try {
            await admin.save()
        } catch (err) {
            return console.log('Failed to Create User:admin. Error : ', err)
        }
        console.log('User:admin as ' + `{email: ${config.admin.email}, pwd: ${config.admin.pwd}} ` + 'Created')
    })  
})
