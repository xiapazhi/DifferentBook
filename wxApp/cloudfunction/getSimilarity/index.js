// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
const usersBooksMapCollection = db.collection('users_books_map')
const usersCollection = db.collection('users')
const booksCollection = db.collection('books')
// 云函数入口函数
exports.main = async(event, context) => {
  try {
    let returnData = {
      user: [],
      book: [],
      map: []
    }
    const wxContext = cloud.getWXContext()
    const mapRes = await usersBooksMapCollection.where({
      main_openid: wxContext.OPENID
    }).orderBy('similarity', 'desc').limit(99).get()
    let userOpenids = []
    if (mapRes.data && mapRes.data.length) {
      const mapData = mapRes.data
      for (let md of mapData) {
        userOpenids.push(md.vice_openid)
      }
    }
    if (userOpenids.length) {
      const userRes = await usersCollection.where({
        openid: _.in(userOpenids)
      }).get()
      if (userRes.data && userRes.data.length) {
        let bookIds = new Set();
        for (let user of userRes.data) {
          if (user.books && user.books.length) {
            user.books.forEach(b => bookIds.add(b))
          }
        }
        bookIds = Array.from(bookIds)
        if (bookIds.length) {
          const bookRes = await booksCollection.where({
            _id: _.in(bookIds)
          }).get()
          if (bookRes.data && bookRes.data.length) {
            returnData = {
              user: userRes.data,
              book: bookRes.data,
              map: mapRes.data
            }
          }
        }
      }
    }
    return returnData
  } catch (e) {
    console.error(e)
  }
}