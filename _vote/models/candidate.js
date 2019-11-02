const mongoose = require('mongoose')

// Schema
let candidateSchema = new mongoose.Schema({
    num: Number,
    name: String,
    description: String,
    vote: Number,
    isDelete: {type: Boolean , default: false},
    create_ts: {type: Date , default: Date.now()}
});

// Return model
module.exports = mongoose.model('Candidate', candidateSchema, 'candidate');
