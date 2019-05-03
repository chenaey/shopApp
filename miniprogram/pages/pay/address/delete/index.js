Page({

  data: {
    username: undefined,
    phone: undefined,
    where: '广东省 广州市 白云区',
    detailwhere: undefined,
    userInfo: undefined,
    id: undefined,
  },

  onChangeName(e) {
    this.setData({
      username: e.detail
    })
  },

  onChangeArea(e) {
    this.setData({
      where: e.detail
    })
  },

  onChangePhone(e) {
    this.setData({
      phone: e.detail
    })
  },

  onChangeDetailWhere(e) {
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
        console.log(res)
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
  onDelete() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确认删除此地址',
      success(res) {
        if (res.confirm) {
          const db = wx.cloud.database()
          db.collection('userData').doc(that.data.id).remove().then(res => {})
          setTimeout(() => {
            wx.redirectTo({
              url: "/pages/pay/address/index",
            })
          }, 800)

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  },
  onLoad: function(options) {
    var that = this
    var id = options.id
    const db = wx.cloud.database()
    db.collection('userData').doc(id).get().then(res => {
      console.log(res.data)
      that.setData({
        username: res.data.username,
        phone: res.data.phone,
        where: res.data.where,
        detailwhere: res.data.detailwhere,
        userInfo: res.data.userInfo,
        id: id,
      })
    })

  },


  onReady: function() {

  },


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