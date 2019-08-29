// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
const usersCollection = db.collection('users')
const usersBooksMapCollection = db.collection('users_books_map')
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async(event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    console.log(event)
    await usersBooksMapCollection.where(
      _.or([{
          main_openid: event.userOpenid
        },
        {
          vice_openid: event.userOpenid
        }
      ])
    ).remove()

    if (event.userBookIds.length) {
      const countUserResult = await usersCollection.count()
      const total = countUserResult.total
      const batchTimes = Math.ceil(total / 100)
      let mapTasks = [];
      for (let i = 0; i < batchTimes; i++) {
        const userRes = await usersCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        console.log(userRes)
        if (userRes && userRes.data) {
          const users = userRes.data
          console.log(users)
          for (let user of users) {
            if (user.openid != event.userOpenid && user.books && user.books.length) {
              let mainSimNum = 0
              let viceSimNum = 0
              for (let bookId of user.books) {
                if (event.userBookIds.some(ubId => ubId == bookId)) {
                  mainSimNum += 1
                }
              }
              for (let bookId of event.userBookIds) {
                if (user.books.some(ubId => ubId == bookId)) {
                  viceSimNum += 1
                }
              }
              if (mainSimNum) {
                let mainSim = ((mainSimNum / event.userBookIds.length) * 100).toFixed(1)
                const promise = usersBooksMapCollection.add({
                  data: {
                    main_openid: event.userOpenid,
                    vice_openid: user.openid,
                    similarity: mainSim
                  }
                })
                mapTasks.push(promise)
              }
              if (viceSimNum) {
                let viceSim = ((viceSimNum / user.books.length) * 100).toFixed(1)
                const promise = usersBooksMapCollection.add({
                  data: {
                    main_openid: user.openid,
                    vice_openid: event.userOpenid,
                    similarity: viceSim
                  }
                })
                mapTasks.push(promise)
              }
            }
          }
        }
      }
      if (mapTasks.length) {
        await Promise.all(mapTasks)
      }
    }
    return {}
  } catch (e) {
    console.log(e)
  }
}