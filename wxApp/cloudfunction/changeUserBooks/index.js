// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const db = cloud.database()
  const wxContext = cloud.getWXContext()

  const booksList = event.booksList;
  for (let v of booksList) {
    if(v.bookName && !v.bookAuthor){
      let currBookRes = db.collection("books").where({
        name:v.bookName
      }).limit(1).get()
    }
    
  }
  let addRes = await db.collection("books").add({
    data: {
      name: booksList[0].bookName,
      author: booksList[0].bookAuthor,
      collect_nums: 0
    }
  })

  return {
    addRes,
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }

}