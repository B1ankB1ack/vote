const candidate = require('../../models/candidate')

// 检查传入投票字串格式是否合规，并返回候选人编号数组
function checkVotesArr(votesStr) {
    return new Promise((resolve, reject) => {
        // 投票数组格式整合
        let votes = []
        let _votes = votesStr.split(',')
        if(_votes.length == 0) reject({success: false, message: '投票格式解析失败'})
        for(let i = 0; i < _votes.length; i++) {
            let vote = Number(_votes[i])
            if(vote === "" || vote == null || isNaN(vote)){
                reject({success: false, message: '投票格式错误'})
            }
            votes.push(vote)
        }

        // 检查投票是否有重复
        for(let i = 0; i < votes.length; i++) {
            for (let j = 0; j < votes.length; j++) {
                if(votes[i] == votes[j] && i != j) reject({success: false, message: '请勿投票同一候选人'})
            }
        }

        // 投票数量检测是否合规
        candidate.count({isDelete: false}, (err, candidateCount) => {
            if(err) reject({success: false, message: '选举人计数失败', err: err})
            let [min, max] = [2, 5]
            let count = Math.floor(candidateCount/2)
            if(candidateCount < 2) reject({success: false, message: '选举人过少，禁止投票'})
            if(count < 5) max = count
            if(votes.length < min || votes.length > max) reject({success: false, message: '投票数量不合规'})

            resolve(votes)
        })
    })
}

// 判断是否满足投票条件
function judge(nums) {
    return new Promise(async (resolve, reject) => {
        // 获取投票候选人数组
        let pList = []
        nums.forEach((num) => {
            pList.push(candidate.findOne({num: num}, (err, candidateResult) => {
                if(err) reject({ success: false, message: '候选人查询失败', err: err})
                else if(!candidateResult) reject({ success: false, message: '投票候选人不存在'})
                else if(candidateResult.isDelete) reject({ success: false, message: '投票候选人已删除'})
            }))
        })
        resolve(await Promise.all(pList))
    })
}

// 投票
async function getCandidatesAndVote(nums) {
    return new Promise(async (resolve, reject) => {
        // 检查投票条件是否满足并获取候选人数组
        let candidateArr = []
        try {
            candidateArr = await judge(nums)
        } catch (errRes) {
            return reject(errRes)
        }
        
        // 计算投票
        for(let i = 0; i < candidateArr.length; i++) {
            console.log(candidateArr[i].num ,'vote+')
            candidateArr[i].vote++
        }

        // 投票保存
        let saveList = []
        candidateArr.forEach((can) => {
            try {
                saveList.push(can.save())
            } catch (err) {
                return reject({ success: false, message: '投票保存失败', err: err})
            }
        })
        await Promise.all(saveList)
        resolve()
    })
}

module.exports = {
    checkVotesArr,
    getCandidatesAndVote
}