// async function a(){
//     let t1 = Date.now()
//     function aFunc() {
//         return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 reject('err')
//                 resolve('a')
//             }, 1000);
//         })
//     }
//     function bFunc() {
//         return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 resolve('b')
//             }, 2000);
//         })
//     }

//     let result = await Promise.all([aFunc(),bFunc()]).catch((err) => {
//         console.log(err)
//     })
//     let t2 = Date.now()
//     console.log(result, t2-t1)
// }
// a()

function p (num) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(num)
            if(num) resolve(num)
            //reject(num)
        }, num*1000);
    })
}

//let arr = [1,2,3]
// async function b() {
//     for(let i = 0; i < arr.length; i++) {
//         console.log('start')
//         let res = await p(arr[i])
//         console.log('end',res)
//     }
// }
// function b() {
//     return new Promise((resolve, reject) => {
//         arr.forEach(async (num) => {
//             let res = await p(num).catch((err) => {
//                 reject(err)
//             })
//             console.log('end',num,res)
//             resolve(res)
//         })
//     })
// }
function b() {
    let pList = []
    arr.forEach((num) => {
        pList.push(p(num))
    })
    return pList
}

async function c() {
    // let resArr = await Promise.all(b()).catch((err) => {
    //     console.log('catch', err)
    // })
    // console.log('res',resArr)
    await arr.forEach(async (v) => {
        p(v)
    })
    console.log('end')
}
//c()

let arrStr = '1,2,3'
let arr = arrStr.split(',')
console.log(arrStr)