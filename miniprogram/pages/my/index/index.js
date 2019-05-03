const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: undefined,
    shopCartCount:0,
  },
  onLookShopCart() {
    wx.switchTab({
      url: "/pages/shoppingCart/index/index",
    })
  },
  onLookMyOrder() {
    wx.showToast({
      title: '暂未开放',
      icon: 'none'
    })
  },
  bindGetUserInfo(e) {
    this.setData({
      userInfo: e.detail.userInfo
    })
  },
  onLookMyAddress() {
    wx.navigateTo({
      url: "/pages/pay/address/index",
    })
  },
  onLoad: function(options) {
    var that = this
    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success(res) {
              that.setData({
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },


  onReady: function() {

  },

  onShow: function() {

  },

  onHide: function() {

  },

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