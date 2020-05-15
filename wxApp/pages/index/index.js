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
    aniExpandBooksIcon: {},
    aniExpandBookUserId: '',
    showModal: false,
    currModalContent: 'editBookList', //'settings',
    currModalTitle: '编辑书单', //'设置',
    windowHeight: 600,
    booksList: [{ //当前登陆用户的书籍信息
      bookName: '',
      bookAuthor: ''
    }],
    originBookList: [{//当前登陆用户的原始书籍信息
      bookName: '',
      bookAuthor: ''
    }],
    map: [],
    user: [],
    book: [],
    defaultAvatarUrl: '../../images/default_avatar.jpg',
    showAllSelfBooks: false,
    selfBooksDomStyle: 'height:76rpx',// 'max-height:76rpx',
    loadModal: false,
    curContrastUserBookData: []
  },

  getUserInfo: function (e) {
    const userInfo = e.detail.userInfo
    this.setData({
      userInfo: userInfo,
      scopeUserInfo: true
    });
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
    const { originBookList } = this.data;
    this.setData({
      showModal: false,
      booksList: originBookList
    })
  },

  submitBookList(e) {
    const {
      booksList
    } = this.data;
    let confirmBooksList = [];
    for (let i in booksList) {
      if (confirmBooksList.some(c => c.bookName == booksList[i].bookName &&
        (!c.bookAuthor || c.bookAuthor != booksList[i].bookAuthor))) {
        return wx.showToast({
          title: `序号为${parseInt(i) + 1}的作品《${booksList[i].bookName}》重复啦`,
          icon: 'none',
        })
      }
      if (booksList[i].bookName) {
        confirmBooksList.push(booksList[i])
      }
    }
    this.setData({
      loadModal: true
    });
    // 调用云函数
    wx.cloud.callFunction({
      name: 'changeUserBooks',
      data: {
        booksList: confirmBooksList
      },
      success: res => {
        this.setData({
          booksList: confirmBooksList,
          originBookList: JSON.parse(JSON.stringify(confirmBooksList)),
          loadModal: false
        })
        this.hideModal()
      },
      fail: err => {
        wx.showToast({
          title: `真不好意思，保存失败啦`,
          icon: 'none',
        })
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
        let booksList = res.result.booksList
        let booksListShow = [];
        for (let b of booksList) {
          booksListShow.push({
            _id:b._id,
            bookName: b.name,
            bookAuthor: b.author
          })
        }
        if (booksListShow.length) {
          that.setData({
            booksList: booksListShow,
            originBookList: JSON.parse(JSON.stringify(booksListShow))
          })
        }
      },
      fail: err => {
        
      }
    })
  },

  getRandomName() {
    switch (Math.floor(Math.random() * 3)) {
      case 0:
        return '钢铁侠'
      case 1:
        return '机器猫'
      case 2:
        return '小书虫'
      default:
        return '神秘用户'
    }
  },

  getSimlirity() {
    const that = this;
    wx.cloud.callFunction({
      name: 'getSimilarity',
      success: res => {
        let {
          user,
          book,
          map
        } = res.result
        for (let m of map) {
          let currUser = user.find(u => u.openid == m.vice_openid);
          if (currUser && currUser.user_info) {
            m.userInfo = currUser.user_info
          } else {
            m.userInfo = {
              avatarUrl: that.data.defaultAvatarUrl,
              nickName: `一位不愿意透漏姓名的${that.getRandomName()}`
            }
          }
        }
        that.setData({
          map,
          user,
          book,
        })
      },
      fail: err => {
        
      }
    })
  },

  expandSelfBooks(e) {
    const {
      showAllSelfBooks
    } = this.data;
    let animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    });
    if (showAllSelfBooks) {
      animation.rotateX(360).step()
      this.setData({
        aniExpandBooksIcon: animation.export(),
        showAllSelfBooks: false,
        selfBooksDomStyle: 'max-height:76rpx'
      })
    } else { //展开
      animation.rotateX(180).step()
      this.setData({
        aniExpandBooksIcon: animation.export(),
        showAllSelfBooks: true,
        selfBooksDomStyle: 'max-height:auto'
      })
    }
  },

  //点击相似用户
  similarUserClick(e) {
    const { user, booksList, book, aniExpandBookUserId } = this.data;
    let { userid } = e.currentTarget.dataset;
    if (userid == aniExpandBookUserId) {
      this.setData({
        aniExpandBookUserId: '',
        curContrastUserBookData: []
      });
      return;
    }
    let curUser = user.find(u => u.openid == userid);
    if (curUser) {
      let curUserBook = curUser.books;
      let curUserBookData = [];
      for (let cub of curUserBook) {
        let bookRes = book.find(b => b._id == cub);
        let isRepeat = booksList.some(b => b._id == cub);
        curUserBookData.push({
          _id: cub,
          name: bookRes.name,
          author: bookRes.author,
          isRepeat,
        })
      }
      
      this.setData({
        curContrastUserBookData: curUserBookData,
        aniExpandBookUserId: userid
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
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
  onReady: function () {
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
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})