//index.js
const app = getApp();
const db = wx.cloud.database();
const dbUsers = db.collection('users');
Page({
  data: {
    scopeUserInfo: false,
    userInfo: null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    aniSettingsRotate: null,
    showModal: false,
    currModalContent: 'editBookList', //'settings',
    currModalTitle: '编辑书单', //'设置',
    windowHeight: 600,
    booksList: [{
      bookName: '',
      bookAuthor: ''
    }],
  },

  getUserInfo: function(e) {
    const userInfo = e.detail.userInfo
    this.setData({
      userInfo: userInfo,
      scopeUserInfo: true
    });
    console.log(userInfo)
    wx.cloud.callFunction({
      name: 'login',
      data: {
        userInfo_: userInfo
      },
      success: res => {

      },
      fail: err => {

      }
    })
  },

  showModal() {
    this.setData({
      showModal: true
    })
  },

  hideModal() {
    this.setData({
      showModal: false
    })
  },

  submitBookList(e) {
    console.log(e)
    const {
      booksList
    } = this.data;
    console.log(booksList);
    let confirmBooksList = [];
    for (let i in booksList) {
      if (confirmBooksList.some(c => c.bookName == booksList[i].bookName)) {
        return wx.showToast({
          title: `序号为${parseInt(i) + 1}的作品《${booksList[i].bookName}》重复啦`,
          icon: 'none',
        })
      }
      if (booksList[i].bookName) {
        confirmBooksList.push(booksList[i])
      }
    }
    // 调用云函数
    wx.cloud.callFunction({
      name: 'changeUserBooks',
      data: {
        booksList: confirmBooksList
      },
      success: res => {
        console.log(res)
      },
      fail: err => {
        console.log(err)
      }
    })
  },

  addBook() {
    let {
      booksList
    } = this.data;
    booksList.push({
      bookName: '',
      bookAuthor: ''
    });
    this.setData({
      booksList: booksList
    })
  },

  delBook(e) {
    console.log(e)
    let {
      booksList
    } = this.data;
    let index = e.currentTarget.dataset.index;
    booksList.splice(index, 1);
    this.setData({
      booksList: booksList
    })
  },

  bookMsgInput(e) {
    console.log(e)
    let {
      booksList
    } = this.data;
    let dataSet = e.currentTarget.dataset;
    let value = e.detail.value.replace(/[\s《》]/g, "");
    if (dataSet.type == 'name') {
      booksList[dataSet.index].bookName = value;
    } else {
      booksList[dataSet.index].bookAuthor = value;
    }
  },

  getBooksList() {
    const that = this;
    wx.cloud.callFunction({
      name: 'getBooksList',
      success: res => {
        console.log(res)
        let booksList = res.result.booksList
        let booksListShow = [];
        for (let b of booksList) {
          booksListShow.push({
            bookName: b.name,
            bookAuthor: b.author
          })
        }
        if (booksListShow.length) {
          that.setData({
            booksList: booksListShow
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },

  getSimlirity() {
    wx.cloud.callFunction({
      name: 'getSimilarity',
      success: res => {
        console.log(res)
        let {
          user,
          book,
          map
        } = res.result

      },
      fail: err => {
        console.log(err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    wx.getUserInfo({
      success: res => {
        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo,
          scopeUserInfo: true
        })
      }
    })

    this.getBooksList()
    this.getSimlirity()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    const that = this;
    //系统信息
    wx.getSystemInfo({
      success(res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      }
    })


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})