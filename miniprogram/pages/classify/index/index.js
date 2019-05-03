// pages/classify/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    buyCount: 1,
    intoView: 'index0',
    userInfo: undefined,
    showAddShopCart: false,
    //添加购物车的商品
    shopData: undefined,
    leftList: ['热门推荐', '人气饮品', '其它'],
    shopDataList: [], //商品列表，根据leftList生成
  },

  onChangBuyCount(e) {
    this.setData({
      buyCount: e.detail
    })
  },

  onChange(event) {
    this.setData({
      active: event.detail,
      intoView: 'index' + event.detail
    })
  },

  lookDetail(e) {
    console.log(e)
    var id = e.currentTarget.dataset.shopid
    wx.navigateTo({
      url: '../../shoppingCart/detail/index?shopId=' + id
    })
  },

  //支付
  toPay() {
    wx.navigateTo({
      url: '../../pay/index'
    })

  },
  bindtouchmove(e) {
    this.setData({
      active: e.currentTarget.dataset.indexf
    })
  },

  onShowAddShopCart(e) {
    var that = this
    if (this.data.showAddShopCart) {
      that.setData({
        showAddShopCart: false
      })
    } else {
      wx.showLoading({
        title: '加载中',
      })
      const db = wx.cloud.database()
      db.collection('shopData').doc(e.currentTarget.dataset.id).get().then(res => {
        that.setData({
          shopData: res.data,
          showAddShopCart: !this.data.showAddShopCart
        })
        wx.hideLoading()
      })
    }
  },

  //选择商品参数
  showShopSelect(e) {
    var indexF = e.currentTarget.dataset.indexf
    var index = e.currentTarget.dataset.index
    var data = this.data.shopData.selectBox[indexF].select
    for (var i = 0; i < data.length; i++) {
      if (i === index) {
        data[i].isSelect = true
      } else {
        data[i].isSelect = false
      }
    }
    this.data.shopData.selectBox[indexF].select = data
    this.setData({
      shopData: this.data.shopData,
    })
  },
  // 加入购物车
  addShopCart(e) {
    var that = this
    var data = that.data.shopData
    var desc = ''
    for (var i = 0; i < data.selectBox.length; i++) {
      for (var j = 0; j < data.selectBox[i].select.length; j++) {
        if (data.selectBox[i].select[j].isSelect) {
          desc += data.selectBox[i].select[j].type + " "
        }
      }
    }
    var len = desc.split(" ").length
    if (desc === "" || len <= data.selectBox.length) {
      wx.showToast({
        title: '请选择商品参数',
        icon: 'none'
      })
    } else {
      var data = that.data.shopData
      const db = wx.cloud.database()
      db.collection('shopCart').add({
        data: {
          avatarUrl: that.data.userInfo.avatarUrl,
          nickName: that.data.userInfo.nickName,
          isPay: false,
          desc: desc,
          shopData: data,
          buyCount: that.data.buyCount
        },
        success: res => {
          if (res.errMsg === 'collection.add:ok') {
            wx.showToast({
              title: '添加至购物车成功',
              icon: 'none',
              duration: 3000
            })
            that.setData({
              showAddShopCart: false
            })
          }

        },
        fail: err => {}
      })
    }
  },

  onLoad: function(options) {
    var that = this
    for (var i = 0; i < that.data.leftList.length; i++) {
      that.data.shopDataList.push([])
    }

    wx.showNavigationBarLoading()
    wx.cloud.callFunction({
      name: 'getAllShopData',
      data: {},
      success: res => {
        if (res.errMsg === "cloud.callFunction:ok") {
          console.log(res.result.data)
          var data = res.result.data
          var leftList = that.data.leftList
          var shopDataList = that.data.shopDataList
          for (var i = 0; i < data.length; i++) {
            var index = leftList.indexOf(data[i].type)
            if (index === -1) {
              shopDataList[leftList.length - 1].push(data[i])
            } else {
              shopDataList[index].push(data[i])

            }
          }
          console.log(shopDataList)
          that.setData({
            shopDataList: shopDataList
          })
          wx.hideNavigationBarLoading()

        }
      },
      fail: err => {
        console.log(err)
      }
    })
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
  bindGetUserInfo(e) {
    var that = this
    console.log(e.detail.errMsg)
    if (e.detail.errMsg === 'getUserInfo:ok') {
      this.setData({
        userInfo: e.detail.userInfo
      })
      that.addShopCart()
    } else {
      wx.showToast({
        title: '加入购物车失败，未授权',
        icon: 'none'
      })
    }
  },
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