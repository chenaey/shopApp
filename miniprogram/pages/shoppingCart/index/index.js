const app = getApp()

Page({
  data: {
    allCheck: false,
    editText: "编辑",
    isEdit: false, //是否处于编辑
    cartData: [],
    totalPrice: 0,
    shopCount: 0,
    shopCartCount: 0,
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
        console.log(res.total)
      })
    })
  },
  onDeleteShop() {
    var that = this
    var deleteList = []
    var data = that.data.cartData
    for (var i = 0; i < data.length; i++) {
      if (data[i].isCheck) {
        deleteList.push(data[i].__id)
      }
    }
    if (that.data.shopCount > 0) {
      wx.showModal({
        title: '提示',
        content: '确定删除这' + deleteList.length + '个商品么',
        success(res) {
          if (res.confirm) {
            const db = wx.cloud.database()
            for (var i = 0; i < deleteList.length; i++) {
              db.collection('shopCart').doc(deleteList[i]).remove()
                .then(console.log)
                .catch(console.error)
            }
            wx.showToast({
              title: '删除完成',
              icon: 'none',
              duration: 5000
            })

            that.setData({
              editText: '编辑',
              isEdit: false
            })
            that.getShopCartData()

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },

  toHome() {
    wx.switchTab({
      url: "/pages/home/index/index"
    })
  },

  onEdit() {
    var that = this
    if (this.data.isEdit) {
      this.setData({
        editText: '编辑',
        isEdit: false
      })
      that.getShopCartData()
    } else {
      var data = this.data.cartData
      for (var i = 0; i < data.length; i++) {
        data[i].isCheck = false
      }
      this.calculatePrice(data) //调用计算价格方法
      this.setData({
        editText: '完成',
        cartData: data,
        allCheck: false,
        isEdit: true
      })
    }
  },
  //商品购买数量
  onChangeSopNum(e) {
    var data = this.data.cartData
    console.log(e.currentTarget.dataset.shopid, e.detail)
    data[e.currentTarget.dataset.index].buyCount = e.detail
    this.setData({
      cartData: data
    })
    //更新数据库中的数量
    const db = wx.cloud.database()
    db.collection('shopCart').doc(e.currentTarget.dataset.shopid).update({
      data: {
        buyCount: e.detail
      }
    }).then(res => {
      console.log(res)
    })
    this.calculatePrice(data) //调用计算价格方法
  },

  //单选
  selectShop(e) {
    var data = this.data.cartData
    data[e.currentTarget.dataset.index].isCheck = e.detail
    var isAllCheck = data.every(obj => {
      return obj.isCheck
    })
    this.setData({
      cartData: data,
      allCheck: isAllCheck
    })
    this.calculatePrice(data) //调用计算价格方法

  },

  //全选
  onSelectAll(e) {
    this.setData({
      allCheck: e.detail
    })
    var data = this.data.cartData
    for (var i = 0; i < data.length; i++) {
      if (e.detail === true) {
        data[i].isCheck = true
      } else {
        data[i].isCheck = false
      }
    }
    this.setData({
      cartData: data
    })
    this.calculatePrice(data) //调用计算价格方法
  },

  //跳转支付页面
  toPay() {
    var that = this
    if (this.data.shopCount > 0) {
      var shopIds = []
      var data = that.data.cartData
      for (var i = 0; i < data.length; i++) {
        if (data[i].isCheck) {
          shopIds.push(data[i].__id)
        }
      }
      wx.navigateTo({
        url: "/pages/pay/index?shopids=" + shopIds
      })
    }

  },

  //计算结算价格
  calculatePrice(data) {
    var totalPrice = 0
    var shopCount = 0
    for (var i = 0; i < data.length; i++) {
      if (data[i].isCheck) {
        totalPrice += (data[i].price * data[i].buyCount)
        shopCount++
      }
    }
    this.setData({
      totalPrice: totalPrice.toFixed(2),
      shopCount: shopCount
    })
  },

  onLoad: function(options) {

  },
  lookDetail(e) {
    console.log(e.currentTarget.dataset.shopid)
    var id = e.currentTarget.dataset.shopid
    wx.navigateTo({
      url: '../../shoppingCart/detail/index?shopId=' + id
    })
  },
  onReady: function() {

  },
  getShopCartData() {
    var that = this
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then(res => {
      const db = wx.cloud.database()
      db.collection('shopCart').where({
        _openid: res.result.openid
      }).get().then(res => {
        if (res.data.length > 0) {
          var data = res.data
          var cartData = []
          //购物车数据表中每个商品含有原来商品的json数据 => shopData
          //为了显示方便将原来的商品数据直接取出将其它的数据添加进去 desc#buyCount#isCheck
          for (var i = 0; i < data.length; i++) {
            data[i].shopData.desc = data[i].desc
            data[i].shopData.buyCount = data[i].buyCount
            data[i].shopData.__id = data[i]._id //__id表示购物车中的商品id
            cartData.push(data[i].shopData)
          }
          wx.hideLoading()
          var isAllCheck = cartData.every(obj => {
            return obj.isCheck
          })
          that.setData({
            cartData: cartData,
            allCheck: isAllCheck
          })
          that.calculatePrice(cartData)
          wx.hideNavigationBarLoading()
        } else {
          that.setData({
            cartData: []
          })
          that.getShopCartCount()
          // that.calculatePrice(cartData)
          wx.hideNavigationBarLoading()
          wx.hideLoading()
        }
      })

    })
  },


  onShow: function() {
    this.getShopCartCount()
    this.getShopCartData()

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