// pages/shoppingCart/detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: undefined,
    showPS: false, //是否显示配送选择按钮
    showAddShopCart: false, //添加购物车按钮
    radio: '送到宿舍',
    desc: '', //选择的参数
    buyCount: 1,
    shopCartCount: 0, //购物车商品数量
    shopData: undefined,
    isOnPay: false //是否显示立即购买
  },
  onChangBuyCount(e) {
    this.setData({
      buyCount: e.detail
    })
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
      shopData: this.data.shopData
    })
  },

  onClickPS(e) {
    this.setData({
      radio: e.currentTarget.dataset.name
    })
  },

  shareToFriend() {

  },
  //支付
  toPay() {
    var that = this
    if (!that.data.showAddShopCart) {
      that.setData({
        showAddShopCart: true,
        isOnPay: true
      })
    } else {
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
        var desc = desc
        var buyCount = that.data.buyCount
        var shopid = that.data.shopData._id
        wx.navigateTo({
          url: "/pages/pay/index?shopid=" + shopid + "&buyCount=" + buyCount + "&desc=" + desc
        })
      }
    }
  },
  onClosePS() {
    this.setData({
      showPS: false
    });
  },

  onOpenPS() {
    this.setData({
      showPS: true
    });
  },

  navigToHome() {
    wx.switchTab({
      url: "/pages/home/index/index",
    })
  },
  //添加到购物车 选择商品参数
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
    that.setData({
      desc: desc
    })
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

  onShowAddShopCart(e) {
    this.setData({
      showAddShopCart: !this.data.showAddShopCart,
      isOnPay: false
    });
  },

  onLoad: function(options) {
    var that = this
    //988c1b1b5cca8ed80a8857f638bf8607
    wx.showNavigationBarLoading()
    var shopId = options.shopId
    // console.log(shopId)
    // shopId = 'ee3099285cca9db50a8f900553956cc6'
    const db = wx.cloud.database()
    db.collection('shopData').doc(shopId).get().then(res => {
      // console.log(res.data)
      that.setData({
        shopData: res.data,
      })
      wx.setNavigationBarTitle({
        title: res.data.title,
      })
      wx.hideNavigationBarLoading()
    })

    that.getShopCartCount() //获取购物车数量
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


  bindGetUserInfo(e) {
    var that = this
    console.log(e.detail.errMsg)
    if (e.detail.errMsg === 'getUserInfo:ok') {
      this.setData({
        userInfo: e.detail.userInfo
      })
      if (that.data.isOnPay) {
        that.toPay()
      } else {
        that.addShopCart()
      }
    } else {
      wx.showToast({
        title: '加入购物车失败，未授权',
        icon: 'none'
      })
    }
  },
  onShow: function() {

  },
  toShopCart() {
    wx.switchTab({
      url: '/pages/shoppingCart/index/index',
    })
  },
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

  getShopCartCount() {
    var that = this
    wx.cloud.callFunction({
      name: 'login',
    }).then(res => {
      const db = wx.cloud.database()
      db.collection('shopCart').where({
        _openid: res.result.openid // 填入当前用户 openid
      }).count().then(res => {
        that.setData({
          shopCartCount: res.total
        })
      })
    })
  },
  onReachBottom: function() {

  },
  onShareAppMessage: function() {

  }
})