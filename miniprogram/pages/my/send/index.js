const app = getApp()
Page({

  data: {
    store: 'cloud://yihetang-0.7969-yihetang-0/store/logo.jpg',
    storeName: undefined,
    orderData: undefined,
  },

  toPay(e) {
    wx.cloud.callFunction({
      name: 'pay',
      data: {
        type: 'orderquery',
        data: {
          out_trade_no: e.currentTarget.dataset.id
        }
      },
      success(res) {
        console.log(res.result.data);
        console.log("订单详情")
        var orderQuery = res.result.data;
        var out_trade_no = orderQuery.out_trade_no;
        const {
          time_stamp,
          nonce_str,
          sign,
          sign_type,
          prepay_id,
          body,
          total_fee
        } = orderQuery;
        //发起支付
        wx.requestPayment({
          timeStamp: time_stamp,
          nonceStr: nonce_str,
          package: `prepay_id=${prepay_id}`,
          signType: 'MD5',
          paySign: sign,
          success(res) {
            console.log("发起支付后")
            console.log(res)
            wx.navigateTo({
              url: "/pages/pay/success/index?out_trade_no=" + out_trade_no,
            })
            wx.hideLoading()
          },
          fail: function(res) {
            wx.showToast({
              title: res.err_desc,
              icon: 'none'
            })
            console.log(res)
          }
        })
      }

    })

  },
  /**
   * 关闭订单
   */
  cancelPay(e) {
    wx.showNavigationBarLoading()
    setTimeout(function() {
      wx.showToast({
        title: '已为您催单,请耐心等待',
        icon: 'none'
      })
      wx.hideNavigationBarLoading()
    }, 500)


  },

  onLoad: function(options) {
    // console.log(app.globalData.storeName)
    this.setData({
      storeName: app.globalData.storeName
    })
  },

  getOrder() {
    var that = this
    wx.showNavigationBarLoading()
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      const db = wx.cloud.database()
      db.collection('shopOrder').where({
        _openid: res.result.openid,
        isTake: false,
        status: 1
      }).get().then(res => {
        console.log(res)
        that.setData({
          orderData: res.data
        })
        wx.hideNavigationBarLoading()
      })
    })
  },
  onShow: function() {
    this.getOrder()
  },

})