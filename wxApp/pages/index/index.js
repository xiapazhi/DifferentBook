//index.js
//获取应用实例
const app = getApp()

Page({
   data: {
      StatusBar: app.globalData.StatusBar,
      CustomBar: app.globalData.CustomBar,
      motto: 'Hi 开发者！',
      userInfo: {},
      hasUserInfo: false,
      canIUse: wx.canIUse('button.open-type.getUserInfo'),

      aniSettingsRotate: null,
      showModal: true,
      currModalContent: 'editBookList', //'settings',
      currModalTitle: '编辑书单', //'设置',
      windowHeight:600,
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
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function() {
      if (app.globalData.userInfo) {
         this.setData({
            userInfo: app.globalData.userInfo,
            hasUserInfo: true
         })
      } else if (this.data.canIUse) {
         // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
         // 所以此处加入 callback 以防止这种情况
         app.userInfoReadyCallback = res => {
            this.setData({
               userInfo: res.userInfo,
               hasUserInfo: true
            })
         }
      } else {
         // 在没有 open-type=getUserInfo 版本的兼容处理
         wx.getUserInfo({
            success: res => {
               app.globalData.userInfo = res.userInfo
               this.setData({
                  userInfo: res.userInfo,
                  hasUserInfo: true
               })
            }
         })
      }
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