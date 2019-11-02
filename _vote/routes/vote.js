const express = require('express');
const router = express.Router();
const vote = require('../controller/vote');
const auth = require('../middleware/auth');

router.post('/', auth.checkToken, auth.checkStatus, vote.vote) // 投票

module.exports = router;