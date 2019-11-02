const mongoose = require('mongoose')

// Schema
let codeCacheSchema = new mongoose.Schema({
    email: String,
    code: String,
    update_ts: { type: Date, default: Date.now }
});

// Return model
module.exports = mongoose.model('Code_cache', codeCacheSchema, 'code_cache');
