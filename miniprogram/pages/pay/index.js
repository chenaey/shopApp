// miniprogram/pages/pay/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPS: false,
    radio: "送到宿舍",
    shopDatas: undefined,
    message: "",
    totalPrice: 0,
    isOnSubmit: false,
    address: undefined,
  },
  onChangeAddress() {
    wx.navigateTo({
      url: "/pages/pay/address/index",
    })
  },
  onChange(event) {
    // event.detail 为当前输入的值
    console.log(event.detail);
  },
  onOpenPS() {
    this.setData({
      showPS: !this.data.showPS
    })
  },
  //计算结算价格
  calculatePrice(data) {
    var that = this
    var totalPrice = 0
    for (var i = 0; i < data.length; i++) {
      totalPrice += (data[i].price * data[i].buyCount)
    }
    that.setData({
      totalPrice: totalPrice,
    })
  },

  onClickPS(e) {
    this.setData({
      radio: e.currentTarget.dataset.name
    })
  },
  onSubmit(e) {
    var that = this
    if (!that.data.address) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      })
    } else {
      that.setData({
        isOnSubmit: true
      })
      wx.showToast({
        title: '发起微信支付...',
        icon: 'none'
      })
    }

  },
  onLoad: function(options) {
    var that = this
    console.log(options)
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '加载中',
    })
    //从购物车结算而来
    if (options.shopids) {
      console.log(options.shopids)
      console.log(typeof options.shopids)
      var shopids = options.shopids.split(",")
      console.log(shopids)
      const db = wx.cloud.database()
      var shopDatas = [] //页面渲染的数据
      for (var i = 0; i < shopids.length; i++) {
        db.collection('shopCart').doc(shopids[i]).get().then(res => {
          var data = res.data
          data.shopData.desc = data.desc
          data.shopData.buyCount = data.buyCount
          data.shopData.__id = data._id //__id表示购物车中的商品id
          shopDatas.push(data.shopData)
        })
      }
      setTimeout(() => {
        that.setData({
          shopDatas: shopDatas,
        })
        that.calculatePrice(shopDatas)
        wx.hideLoading()
        wx.hideNavigationBarLoading()
        console.log(shopDatas)
      }, 2500)
    }
    var shopid = options.shopid
    var buyCount = options.buyCount
    var desc = options.desc
    // shopid = '9c4488c75cca9c570a910dc572d9f678'
    // buyCount = 2
    // desc = "去冰 中 "
    const db = wx.cloud.database()
    db.collection('shopData').doc(shopid).get().then(res => {
      var data = res.data
      var shopDatas = []
      data.desc = desc
      data.buyCount = buyCount
      shopDatas.push(data)
      that.setData({
        shopDatas: shopDatas,
      })
      that.calculatePrice(shopDatas)
      wx.hideNavigationBarLoading()
      wx.hideLoading()

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



  onReachBottom: function() {

  },

})