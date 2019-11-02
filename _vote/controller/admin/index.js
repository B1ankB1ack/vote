const candidate = require('../../models/candidate')
const user = require('../../models/user')


// 新增候选人资料
function addCandidate(req, res, next) {
    // 检查选举是否开始
    if(req.voteStatus) return res.json({success: false, message: '选举已经开始'})

    let name = req.body.name
    let description = req.body.description

    // 验证是否漏参及参数格式
    if(!(name && description)) return res.json({success: false, message: '缺少关键参数'})
    
    candidate.count({}, async (err, count) => {
        if(err) return res.json({success: false, message: '候选人数量统计失败', err: err})
        let num = count + 1
        let newCandidate = new candidate({
            num: num,
            name: name,
            description: description,
            vote: 0
        })
        try {
            await newCandidate.save()
        } catch (err) {
            return res.json({success: false, message: '新增资料保存失败', err: err})
        }
        res.json({success: true, message: '新增候选人资料成功'})
    })
}

// 删除候选人资料
function deleteCandidate(req, res, next) {
    // 检查选举是否开始
    if(req.voteStatus) return res.json({success: false, message: '选举已经开始'})

    let num = req.body.num

    // 验证是否漏参及参数格式
    if(!num) return res.json({success: false, message: '缺少关键参数:候选人编号'})

    candidate.findOne({num: num}).exec(async (err, candidateResult) => {
        if(err) return res.json({success: false, message: '候选人资料删除失败', err: err})
        if(!candidateResult) return res.json({success: false, message: '无候选人资料'})
        candidateResult.isDelete = true
        try {
            await candidateResult.save()
        } catch (err) {
            return res.json({success: false, message: '删除资料保存失败', err: err})
        }
        res.json({success: true, message: '候选人资料已删除'})
    })
}

// 更新候选人资料
function updateCandidate(req, res, next) {
    // 检查选举是否开始
    if(req.voteStatus) return res.json({success: false, message: '选举已经开始'})

    let num = req.body.num
    let name = req.body.name
    let description = req.body.description

    // 验证是否漏参及参数格式
    if(!num) return res.json({success: false, message: '缺少关键参数:候选人编号'})

    candidate.findOne({num: num}).exec(async (err, candidateResult) => {
        if(err) return res.json({success: false, message: '候选人资料查询失败', err: err})
        if(!candidateResult) return res.json({success: false, message: '无候选人资料'})
        if(name) candidateResult.name = name
        if(description) candidateResult.description = description
        try {
            await candidateResult.save()
        } catch (err) {
            return res.json({success: false, message: '更新资料保存失败', err: err})
        }
        res.json({success: true, message: '候选人资料已更新'})
    })
}

// 查询候选人资料
function lookupCandidate(req, res, next) { 
    let num = req.body.num

    // 验证是否漏参及参数格式
    if(!num) return res.json({success: false, message: '缺少关键参数:候选人编号'})

    candidate.findOne({num: num}).exec((err, candidateResult) => {
        if(err) return res.json({success: false, message: '候选人资料查询失败', err: err})
        if(!candidateResult) return res.json({success: false, message: '无候选人资料'})
        res.json({success: true, message: '查询成功', data: candidateResult})
    })
}

// 获取投票结果
function getVoteList(req, res, next) {
    candidate.find({isDelete: false}).exec((err, candidateResult) => {
        if(err) return res.json({success: false, message: '候选人资料查询失败', err: err})
        let candidateList = []
        for(let i = 0; i < candidateResult.length; i++) {
            candidateList.push({
                name: candidateResult[i].name,
                description: candidateResult[i].description,
                vote: candidateResult[i].vote
            })
        }
        res.json({success: true, message: '查询成功', data: candidateList})
    })
}

// 选举开始
function voteStart(req, res, next) {
    user.findOne({isAdmin: true}).exec(async (err, admin) => {
        if(err) return res.json({success: false, message: '查询管理数据失败', err: err})
        if(!admin) return res.json({success: false, message: '无管理员账户'})
        admin.status = true
        try {
            await admin.save()
        } catch (err) {
            return res.json({success: false, message: '更新资料保存失败', err: err})
        }
        res.json({success: true, message: '选举开始'})
    })
}

// 选举结束
function voteEnd(req, res, next) {
    user.findOne({isAdmin: true}).exec(async (err, admin) => {
        if(err) return res.json({success: false, message: '查询管理数据失败', err: err})
        if(!admin) return res.json({success: false, message: '无管理员账户'})
        admin.status = false
        try {
            await admin.save()
        } catch (err) {
            return res.json({success: false, message: '更新资料保存失败', err: err})
        }
        res.json({success: true, message: '选举结束'})
    })
}

module.exports = {
    addCandidate,
    deleteCandidate,
    updateCandidate,
    lookupCandidate,
    getVoteList,
    voteStart,
    voteEnd
}