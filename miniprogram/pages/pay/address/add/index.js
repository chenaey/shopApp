Page({

  data: {
    username: undefined,
    phone: undefined,
    where: '广东省 广州市 白云区',
    detailwhere: undefined,
    userInfo: undefined
  },

  onChangeName(e) {
    console.log(e.detail)
    this.setData({
      username: e.detail
    })
  },

  onChangeArea(e) {
    console.log(e.detail)
    this.setData({
      where: e.detail
    })
  },

  onChangePhone(e) {
    console.log(e.detail)
    this.setData({
      phone: e.detail
    })
  },

  onChangeDetailWhere(e) {
    console.log(e.detail)
    this.setData({
      detailwhere: e.detail
    })
  },
  onSave() {
    var that = this
    if (!that.data.username || !that.data.phone || !that.data.where || !that.data.detailwhere) {
      wx.showToast({
        title: '错误，信息未填写完全',
        icon: 'none'
      })
    } else {
      const db = wx.cloud.database()
      db.collection('userData').add({
        data: {
          username: that.data.username,
          phone: that.data.phone,
          where: that.data.where,
          userInfo: that.data.userInfo,
          detailwhere: that.data.detailwhere
        }
      }).then(res => {
        if (res.errMsg === 'collection.add:ok') {
          wx.redirectTo({
            url: "/pages/pay/address/index",
          })
        }
      })
    }
  },



  onClose() {
    this.setData({
      show: !this.data.show
    })
  },

  fromWx() {
    var that = this
    wx.chooseAddress({
      success(res) {
        that.setData({
          username: res.userName,
          phone: res.telNumber,
          where: res.provinceName + " " + res.cityName + " " + res.countyName + " ",
          detailwhere: res.detailInfo
        })
        // console.log(res)
        // console.log()
        // console.log(res.postalCode)
        // console.log()
        // console.log(res.detailInfo)
      }
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