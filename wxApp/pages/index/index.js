//index.js
//获取应用实例
const app = getApp()

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
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
         userInfo: e.detail.userInfo,
         scopeUserInfo: true
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
      // 调用云函数
      wx.cloud.callFunction({
         name: 'changeUserBooks',
         data: {
            booksList: booksList
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
      let value = e.detail.value;
      if (dataSet.type == 'name') {
         booksList[dataSet.index].bookName = value;
      } else {
         booksList[dataSet.index].bookAuthor = value;
      }
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
   },

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function() {
      const that = this;
      wx.getSystemInfo({
         success(res) {
            console.log(res.windowHeight)
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