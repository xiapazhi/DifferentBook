// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async(event, context) => {
  try {
    // const wxContext = cloud.getWXContext()
    const booksList = event.booksList;
    const booksCollection = db.collection("books");
    const userBooksCollection = db.collection("user_books");
    const userInfo = event.userInfo;
    let userBooks = await userBooksCollection.where({
      openid: userInfo.openId
    }).limit(1).get();
    if(userBooks.data.length){
      let books = userBooks.data[0].books;
      if(books && books.length){
        await booksCollection.where({
          _id: _.in(books)
        }).update({
          data: {
            collect_nums: _.inc(-1)
          }
        })
      }
    }

    let userBookIds = [];
    for (let v of booksList) {
      let getBookWhereParam = {
        name: v.bookName
      };
      let addBookDataParam = {
        name: v.bookName,
        collect_nums: 1
      }
      if (v.bookAuthor) {
        getBookWhereParam.author = v.bookAuthor;
        addBookDataParam.author = v.bookAuthor;
      }
      let currBookRes = await booksCollection.where({
        name: v.bookName
      }).limit(1).get()
      if (currBookRes.data.length) {
        const bookResId = currBookRes.data[0]._id;
        userBookIds.push(bookResId);
        await db.collection('books').where({
          _id: bookResId
        }).update({
          data: {
            collect_nums: _.inc(1)
          }
        })
      } else {
        let addRes = await booksCollection.add({
          data: addBookDataParam
        })
        userBookIds.push(addRes._id);
      }
    }


    if (userBooks.data.length) {
      await userBooksCollection.where({
        _id: userBooks.data[0]._id
      }).update({
        data: {
          books: userBookIds
        }
      })
    } else {
      let addRes = await userBooksCollection.add({
        data: {
          openid: userInfo.openId,
          books: userBookIds
        }
      })
    }
    return {

    }
  } catch (e) {
    console.error(e)
  }
}