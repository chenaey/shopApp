Page({
  data: {
    showNotice: false,
    notice: '',
    shopData: undefined,
    showAddShop: false,
    title: undefined,
    price: undefined,
    fee: 0,
    lessCount: 9999,
    type: '热门推荐',
    desc: undefined,
    upTopImg: [],
    upDetailImg: [],
    isOnline: true,
    isSelectBox: false,
    selectBoxText: "温度,冰,少冰,去冰#糖分,正常糖,少糖",
    selectBox: [{
      name: '温度',
      select: [{
        type: "冰",
        isSelect: false
      }, {
        type: "少冰",
        isSelect: false
      }, {
        type: "去冰",
        isSelect: false
      }]
    }, {
      name: '糖分',
      select: [{
        type: "正常糖",
        isSelect: false
      }, {
        type: "少糖",
        isSelect: false
      }]
    }]

  },
  selectBoxText(e) {
    console.log(e.detail)
    var data = this.parseString(e.detail)
    console.log(data)
    if (data[0].select.length > 0) {
      this.setData({
        selectBox: data
      })
      wx.showToast({
        title: '内容有效',
        icon: "none",
        duration: 500
      })
    } else {
      wx.showToast({
        title: '输入的内容无效',
        icon: "none",
        duration: 500
      })
    }

  },
  deleteImg(e) {
    this.data.upTopImg.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      upTopImg: this.data.upTopImg
    })
  },

  deleteImg0(e) {
    this.data.upDetailImg.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      upDetailImg: this.data.upDetailImg
    })
  },

  chooseImage: function() {
    var that = this
    wx.chooseImage({
      count: 5,
      // sizeType: 'original',
      success: function(res) {
        var data = that.data.upTopImg
        data = data.concat(res.tempFilePaths)
        console.log(res)
        console.log(data)
        that.setData({
          upTopImg: data,
        })
      }
    })
  },

  chooseImage0() {
    var that = this
    wx.chooseImage({
      count: 9,
      success: function(res) {
        var data = that.data.upDetailImg
        data = data.concat(res.tempFilePaths)
        that.setData({
          upDetailImg: data
        })
      }
    })
  },
  previewImage: function(e) {
    var that = this
    wx.previewImage({
      urls: that.data.upTopImg
    })
  },
  previewImage0: function(e) {
    var that = this
    // [e.currentTarget.dataset.index]
    wx.previewImage({
      urls: that.data.upDetailImg
    })
  },
  onClickSJ(e) {
    this.setData({
      isOnline: e.detail
    })
  },
  isSelectBox(e) {
    this.setData({
      isSelectBox: e.detail
    })
  },
  onSubmit() {
    var that = this
    if (!that.data.title || !that.data.price || !that.data.lessCount || !that.data.type || !that.data.desc || that.data.upTopImg.length === 0 || that.data.upDetailImg.length === 0) {
      wx.showToast({
        title: '错误，信息未填写完全',
        icon: 'none',
      })
    } else {
      wx.showNavigationBarLoading()
      wx.showLoading({
        title: '上传中',
      })
      var detailImg = []
      var detailInfo = []

      var upTopImg = that.data.upTopImg
      var upDetailImg = that.data.upDetailImg
      var upImgList = upTopImg.concat(upDetailImg)
      var imgList = []
      var num = 0
      for (var i = 0; i < upImgList.length; i++) {
        var timestamp = 'A' + i + 'A' + +new Date().getTime()
        const cloudPath = 'shopDataImg/' + timestamp + upImgList[i].match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: upImgList[i], // 文件路径
        }).then(res => {
          console.log(res.fileID)
          if (res.fileID) {
            console.log(res)
            imgList.push(res.fileID)
            num += 1
            //最后一个文件上传
            console.log('最后一个文件上传')
            console.log(num)
            console.log(upImgList.length)
            if (num === upImgList.length) {
              const db = wx.cloud.database()
              var selectBox = undefined
              if (that.data.isSelectBox) {
                selectBox = that.data.selectBox
              }
              var shopId = 'A' + new Date().getTime()
              console.log(imgList)

              imgList.sort(function(a, b) {
                return a.match(/A(\d)A/)[1] - b.match(/A(\d)A/)[1]
              })
              db.collection('shopData').add({
                data: {
                  shopId: shopId,
                  price: that.data.price * 100,
                  sellCount: that.data.sellCount,
                  fee: that.data.fee, //配送费
                  lessCount: that.data.lessCount,
                  type: that.data.type,
                  title: that.data.title,
                  isCheck: true,
                  descs: that.data.desc,
                  isOnline: that.data.isOnline, //是否上架
                  img: imgList.slice(0, 1)[0],
                  detailImg: imgList.slice(0, upTopImg.length),
                  detailInfo: imgList.slice(upTopImg.length),
                  selectBox: selectBox
                }
              }).then(res => {
                console.log(res)
                wx.hideNavigationBarLoading()
                wx.hideLoading()
                wx.showToast({
                  title: '上传成功',
                  icon: 'none'
                })
              })
              console.log('完成')
            }
          }
        }).catch(error => {})
      }
    }
  },
  onClose(e) {
    this.setData({
      showAddShop: !this.data.showAddShop
    })
  },

  onClickNotice() {
    var that = this
    that.setData({
      showNotice: !that.data.showNotice
    })
  },

  onChangeNotice(e) {
    this.setData({
      notice: e.detail
    })
  },

  toDelete(e) {
    console.log(e.currentTarget.dataset.id)
    wx.showModal({
      title: '提示',
      content: '确定删除此商品',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          const db = wx.cloud.database()
          db.collection('shopData').doc(e.currentTarget.dataset.id).remove().then(res => {
            console.log(res)
            wx.showToast({
              title: '删除成功',
              icon: 'none'
            })
          })
        }
      }
    })
  },

  lookDetail(e) {
    // console.log(e.currentTarget.dataset.shopid)
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/shoppingCart/detail/index?shopId=' + id
    })
  },
  ontitle(e) {
    this.setData({
      title: e.detail
    })
  },
  ondesc(e) {
    this.setData({
      desc: e.detail
    })
  },
  onprice(e) {
    this.setData({
      price: e.detail
    })
  },
  onfee(e) {
    this.setData({
      fee: e.detail
    })
  },
  onlessCount(e) {
    this.setData({
      lessCount: e.detail
    })
  },
  ontype(e) {
    this.setData({
      type: e.detail
    })
  },
  onAddNewShop() {

  },
  parseString(selectBoxText) {
    // var selectBoxText = "温度,冰,去冰#大小,小,大";
    var selectBoxText = selectBoxText.split("#")
    var selectBox = []
    var list = []
    for (var i = 0; i < selectBoxText.length; i++) {
      list.push(selectBoxText[i].split(","))
    }
    for (var i = 0; i < list.length; i++) {
      var obj = {
        name: '',
        select: []
      }
      for (var j = 0; j < list[i].length; j++) {
        if (j === 0) {
          obj.name = list[i][0]
        } else {
          obj.select.push({
            type: list[i][j],
            isSelect: false
          })
        }
      }
      selectBox.push(obj)
    }
    return selectBox
  },
  updatNotice() {
    var that = this
    const db = wx.cloud.database()
    db.collection('staticData').doc("ee3099285ccd892d0bfec45b2629338d").update({
      data: {
        notice: that.data.notice
      }
    }).then(res => {
      if (res.stats.updated === 1) {
        wx.showToast({
          title: '更新成功',
          icon: 'none'
        })
        that.getNotice()
      }

    })
  },
  getNotice() {
    var that = this
    const db = wx.cloud.database()
    db.collection('staticData').doc("ee3099285ccd892d0bfec45b2629338d").get().then(res => {
      console.log(res.data.notice)
      that.setData({
        notice: res.data.notice
      })
    })
  },
  onLoad: function(options) {
    var that = this

    // wx.cloud.callFunction({
    //   name: 'getAllShopData'
    // }).then(res => {
    //   that.setData({
    //     shopData: res.result.data
    //   })
    // })
  },
  onShow: function() {
    var that = this
    that.getNotice()
    wx.cloud.callFunction({
      name: 'getAllShopData'
    }).then(res => {
      that.setData({
        shopData: res.result.data
      })
    })
  },





})