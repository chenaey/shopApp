// pages/pay/success/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: undefined,
  },

  look() {
    wx.navigateTo({
      url: '/pages/my/order/index',
    })
  },
  onLoad: function(options) {
    var that = this
    var out_trade_no = options.out_trade_no
    wx.cloud.callFunction({
      name: 'pay',
      data: {
        type: 'payorder',
        data: {
          // body,
          // prepay_id,
          out_trade_no,
          // total_fee
        }
      },
      success(res) {
        console.log(res.result.data)
        that.setData({
          order: res.result.data
        })
      }
    });
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