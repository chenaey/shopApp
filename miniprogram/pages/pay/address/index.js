// pages/pay/address/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: [],
    show: false,
  },

  onClickAddress(e) {
    var that = this
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    console.log(pages)
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      address: that.data.address[e.currentTarget.dataset.id]
    })
    wx.navigateBack({
      delta: prevPage
    })

    // wx.navigateTo({
    //   url: "/pages/pay/index?addid=" + e.currentTarget.dataset.id,
    // })
  },

  toEdit(e) {
    wx.redirectTo({
      url: "/pages/pay/address/delete/index?id=" + e.currentTarget.dataset.id,
    })
  },
  onClose() {
    this.setData({
      show: !this.data.show
    })
  },

  onAddAddress(e) {
    wx.redirectTo({
      url: "/pages/pay/address/add/index",
    })
  },

  onLoad: function(options) {
    var that = this

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    wx.showNavigationBarLoading()
    wx.cloud.callFunction({
      name: 'login',
    }).then(res => {
      console.log(res.result.openid)
      const db = wx.cloud.database()
      db.collection('userData').where({
        _openid: res.result.openid
      }).get().then(res => {
        that.setData({
          address: res.data
        })
        wx.hideNavigationBarLoading()
        console.log(res.data)
      })
    })

  },

  onHide: function() {

  },

  onUnload: function() {

  },


  onPullDownRefresh: function() {

  },

  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})