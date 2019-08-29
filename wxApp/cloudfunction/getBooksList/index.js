// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
const usersCollection = db.collection('users')
const booksCollection = db.collection('books')
// 云函数入口函数
exports.main = async(event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    // const countResult = await db.collection('todos').count()
    let userBooksRes = await usersCollection.where({
      openid: wxContext.OPENID
    }).limit(1).get();
    let booksList = []
    if (userBooksRes.data.length) {
      let userBooksId = userBooksRes.data[0].books;
      console.log(userBooksRes)
      if (userBooksId && userBooksId.length) {
        for (let i = 0; i < userBooksId.length; i += 100) {
          let queryBooksId = userBooksId.slice(i, i + 100)
          let queryBooksRes = await booksCollection.where({
            _id: _.in(queryBooksId)
          }).limit(100).get();
          if (queryBooksRes.data.length) {
            booksList = booksList.concat(queryBooksRes.data)
          }
        }
      }
    }
    console.log(booksList)

    return {
      booksList
    }
  } catch (e) {
    console.error(e)
  }
}