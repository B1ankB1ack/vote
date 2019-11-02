var config = {
    mail: {
        host: 'smtp.qq.com',
        port: 465,
        auth: {
            user: '969284250@qq.com',
            pass: 'affshbrqhiyhbead'
        }
    },

    token_key: 'PRIVATEKEY',

    admin: {
        email: 'admin@root.com',
        pwd: 'admin'
    },
    
    db: {
        host: 'localhost',
        user: 'sky',
        pwd: 'password',
        port: 27017,
        database: 'vote',
        auth: 'admin',
    }
}

module.exports = config