const mongoose = require('mongoose')

// Schema
let tokenCacheSchema = new mongoose.Schema({
    email: String,
    pwd: String,
    create_ts: Date,
    expired_ts: Date,
    isLogin: Boolean
});

// Return model
module.exports = mongoose.model('Token_cache', tokenCacheSchema, 'token_cache');
