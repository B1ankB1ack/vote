const user = require('../../models/user')
const candidate = require('../../models/candidate')
const utils = require('./vote-utils')

async function vote(req, res, next) {
    let email = req.body.email
    let votesStr = req.body.votes

    // 检查选举是否开始
    if(!req.voteStatus) return res.json({success: false, message: '选举尚未开始'})
    
    // 验证是否漏参及参数格式
    if(!(email && votesStr)) return res.json({ success: false, message: '缺少参数'})
    let votes
    try {
        votes = await utils.checkVotesArr(votesStr)
    } catch(errRes) {
        return res.json(errRes)
    }
    if(!Array.isArray(votes)) return res.json({ success: false, message: '投票解析失败'})

    // 投票
    await user.findOne({email: email}).exec(async (err, userResult) => {
        if(err) return res.json({ success: false, message: '查询用户失败', err: err })
        else if(userResult.candidate.length > 0) return res.json({ success: false, message: '请勿重复投票'})
        
        // 保存用户的投票
        else userResult.candidate = votes
        try {
            await userResult.save()
        } catch (err) {
            return res.json({ success: false, message: '用户投票保存失败', err: err})
        }
        
        // 给候选人投票计数
        try {
            await utils.getCandidatesAndVote(votes)
        } catch (errRes) {
            return res.json(errRes)
        }
        res.json({success: true, message: '投票成功'})
    })

}

module.exports = {
    vote
}