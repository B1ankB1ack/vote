const mongoose = require('mongoose')

// Schema
let userSchema = new mongoose.Schema({
    email: String,
    pwd: String,
    candidate: [Number],
    isAdmin: {type: Boolean , default: false},
    create_ts: {type: Date , default: Date.now()},
    status: Boolean
});

// Return model
module.exports = mongoose.model('User', userSchema, 'user');
