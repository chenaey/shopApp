//app.js
App({
  onLaunch: function() {
    var that = this
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success(res) {
              that.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })
  },
  globalData: {
    httpName: "https://www.i7code.cn",
    userInfo: undefined,
  }
})