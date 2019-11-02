const express = require('express');
const router = express.Router();

/* GET test */
router.get('/test', function (req, res, next) {
    res.json({ success: true, message: 'test' });
});

router.use('/user', require('./user')) // 用户登录系统
router.use('/vote', require('./vote')) // 用户投票系统
router.use('/admin', require('./admin')) // 运维人员管理投票系统

module.exports = router;
