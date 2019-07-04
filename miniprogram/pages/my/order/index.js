const app = getApp()
Page({

  data: {
    store: 'cloud://yihetang-0.7969-yihetang-0/store/logo.jpg',
    storeName: undefined,
    orderData: undefined,
  },


  onLoad: function(options) {
    // console.log(app.globalData.storeName)
    this.setData({
      storeName: app.globalData.storeName
    })
  },



  onShow: function() {
    var that = this
    wx.showNavigationBarLoading()
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      const db = wx.cloud.database()
      db.collection('shopOrder').where({
        _openid: res.result.openid,
        status: 1
      }).get().then(res => {
        that.setData({
          orderData: res.data
        })
        wx.hideNavigationBarLoading()
        console.log(res.data)
      })
    })
  },


})