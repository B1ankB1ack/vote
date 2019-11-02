const express = require('express')
const router = express.Router()
const admin = require('../controller/admin')
const auth = require('../middleware/auth')

router.post('/get_vote_list', auth.checkToken ,auth.checkAdmin, admin.getVoteList) // 获取投票结果
router.post('/add_candidate', auth.checkToken ,auth.checkAdmin, auth.checkStatus, admin.addCandidate) // 新增候选人资料
router.post('/delete_candidate', auth.checkToken ,auth.checkAdmin, auth.checkStatus, admin.deleteCandidate) // 删除候选人资料
router.post('/lookup_candidate', auth.checkToken ,auth.checkAdmin, auth.checkStatus, admin.lookupCandidate) // 查询候选人资料
router.post('/update_candidate', auth.checkToken ,auth.checkAdmin, auth.checkStatus, admin.updateCandidate) // 更新候选人资料
router.post('/vote_start', auth.checkToken ,auth.checkAdmin, admin.voteStart) // 控制选举开始
router.post('/vote_end', auth.checkToken ,auth.checkAdmin, admin.voteEnd) // 控制选举结束

module.exports = router;