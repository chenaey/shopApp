// miniprogram/pages/pay/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPS: false,
    radio: "送到宿舍",
    message: "",
    shopDatas: undefined,
    totalPrice: 0,
    desc: "",
    isOnSubmit: false,
    address: undefined,
    userInfo: undefined,
    out_trade_no: undefined,
    order: undefined,
    orderData: []
  },
  // onChangeRadio(e){
  //   console.log(e)
  // },
  onChangeAddress() {
    wx.navigateTo({
      url: "/pages/pay/address/index",
    })
  },
  onChange(event) {
    // event.detail 为当前输入的值
    console.log(event.detail);
    this.setData({
      message: event.detail
    })
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
  getAddress() {
    var that = this
    wx.cloud.callFunction({
      name: 'login',
    }).then(res => {
      const db = wx.cloud.database()
      db.collection('userData').where({
        _openid: res.result.openid
      }).get().then(res => {
        if (res.data.length) {
          that.setData({
            address: res.data[0]
          })
        }
      })
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
  
      wx.showLoading({
        title: '正在支付',
      })
      //发起微信支付
      var userInfo = that.data.userInfo
      // userInfo.openId = "ozdN65fCeI85Y6_q3q-DRxfFlQq0"
      wx.cloud.callFunction({
        name: 'pay',
        data: {
          type: 'unifiedorder',
          data: {
            // goodIds: ids,
            goods: that.data.orderData, //订单标题和选择
            address: that.data.address, //买家地址
            message: that.data.message, //买家留言,
            sendType: that.data.radio, //配送方式
          },
          // userInfo: userInfo
        }
      }).then(res => {
        console.log(res.result.data)

        //失败返回 
        if (res.result.code === 1) {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          })
          return
        }
        // var orderQuery = res.result.data;
        var out_trade_no = res.result.data.out_trade_no;
        //到微信支付测查询订单是否存在
        wx.cloud.callFunction({
          name: 'pay',
          data: {
            type: 'orderquery',
            data: {
              // out_trade_no: this.data.out_trade_no
              out_trade_no: out_trade_no
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
                console.log(res)
                wx.hideLoading()
              }
            })
          }
        })
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
      var shopids = options.shopids.split(",")
      console.log(shopids)
      const db = wx.cloud.database()
      var shopDatas = [] //页面渲染的数据
      var len = 0
      var orderData = []
      for (var i = 0; i < shopids.length; i++) {
        db.collection('shopCart').doc(shopids[i]).get().then(res => {
          len += 1
          var data = res.data
          // that.data.desc += data.desc+ "#"
          orderData.push({
            desc: data.desc,
            shopId: data._id,
            title: data.shopData.title,
            buyCount: data.buyCount,
            price: data.shopData.price
          })
          data.shopData.desc = data.desc
          data.shopData.buyCount = data.buyCount
          data.shopData.__id = data._id //__id表示购物车中的商品id
          shopDatas.push(data.shopData)
          if (len === shopids.length) {
            wx.hideLoading()
            wx.hideNavigationBarLoading()
            that.setData({
              shopDatas: shopDatas,
              orderData: orderData
            })
            console.log(shopDatas)
            console.log(that.data.orderData)
            that.calculatePrice(shopDatas)

          }
        })
      }
    }
    if (options.shopid) {
      var shopid = options.shopid
      var buyCount = parseInt(options.buyCount)
      var desc = options.desc
      const db = wx.cloud.database()
      var orderData = []
      db.collection('shopData').doc(shopid).get().then(res => {
        console.log(res)
        var data = res.data
        var shopDatas = []
        data.desc = desc
        data.buyCount = buyCount
        shopDatas.push(data)
        orderData.push({
          desc: desc,
          shopId: res.data_id,
          title: res.data.title,
          buyCount: buyCount,
          price: res.data.price
        })
        that.setData({
          shopDatas: shopDatas,
          orderData: orderData
        })
        that.calculatePrice(shopDatas)
        wx.hideNavigationBarLoading()
        wx.hideLoading()
      })
    }


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
    that.getAddress() //查看是否有收货地址
  },

  /**
   * 获取订单详情
   */
  getOrder: function() {
    var that = this
    wx.cloud.callFunction({
      name: 'pay',
      data: {
        type: 'orderquery',
        data: {
          // out_trade_no: this.data.out_trade_no
          out_trade_no: 'A1557291212063-1557382917117'
        }
      },
      success(res) {
        console.log(res);
        console.log("订单详情")
        that.setData({
          order: res.data
        });
      },
      fail(err) {
        console.log(err)
      }
    })
  }
})