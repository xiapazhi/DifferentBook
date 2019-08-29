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
    const usersCollection = db.collection("users");
    const userInfo = event.userInfo;
    let userBooks = await usersCollection.where({
      openid: userInfo.openId
    }).limit(1).get();
    if (userBooks.data.length) {
      let books = userBooks.data[0].books;
      if (books && books.length) {
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
      await usersCollection.where({
        _id: userBooks.data[0]._id
      }).update({
        data: {
          books: userBookIds
        }
      })
    } else {
      let addRes = await usersCollection.add({
        data: {
          openid: userInfo.openId,
          books: userBookIds
        }
      })
    }

    await cloud.callFunction({
      // 要调用的云函数名称
      name: 'calculateSimilarity',
      // 传递给云函数的参数
      data: {
        userBookIds: userBookIds,
        userOpenid: userInfo.openId,
      }
    })

    return {

    }
  } catch (e) {
    console.error(e)
  }
}