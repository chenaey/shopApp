const app = require('tcb-admin-node');
const pay = require('./lib/pay');
const {
  mpAppId,
  KEY
} = require('./config/index');
const {
  WXPayConstants,
  WXPayUtil
} = require('wx-js-utils');
const Res = require('./lib/res');
const ip = require('ip');

/**
 *
 * @param {obj} event
 * @param {string} event.type 功能类型
 * @param {} userInfo.openId 用户的openid
 */
exports.main = async function(event) {
  const {
    type,
    data,
    userInfo
  } = event;
  const openid = userInfo.openId;

  app.init();
  const db = app.database();
  const _ = db.command;
  const goodCollection = db.collection('shopData');
  const orderCollection = db.collection('shopOrder');

  // 订单文档的status 0 未支付 1 已支付 2 已关闭
  switch (type) {
    // [在此处放置 unifiedorder 的相关代码]
    case 'unifiedorder':
      {
        // 在云函数参数中，提取商品 ID
        const {
          goods,
          address, //买家地址
          message, //买家留言,
          sendType, //配送方式
        } = data;
        // let goods = await goodCollection.do({
        //   _id: _.in(goodIds)
        // }).get();
        // if (!goods.data.length) {
        //   return new Res({
        //     code: 1,
        //     message: '找不到商品'
        //   });
        // }
        // 在云函数中提取数据，包括名称、价格才更合理安全，
        // 因为从端里传过来的商品数据都是不可靠的 为了快速上线 忽略此处
        let good = goods[0];
        var total_fee = 0
        var body = ""
        for (var i = 0; i < goods.length; i++) {
          total_fee += goods[i].price * goods[i].buyCount
          body += goods[i].title + "#"
        }
        let store = await db.collection('store').where({
          _id: '96c1cbbe5cd2db280e5c03d62649befa'
        }).get();
        var free_fee = store.data[0].free_fee
        var fee = store.data[0].fee
        if (total_fee > free_fee) {
          total_fee += fee
        }

        // 拼凑微信支付统一下单的参数
        const curTime = Date.now();
        const tradeNo = `${Math.ceil(Math.random() * 100000)}-${curTime}`;
        const spbill_create_ip = ip.address() || '127.0.0.1';
        // 云函数暂不支付 http 触发器，因此这里回调 notify_url 可以先随便填。
        const notify_url = 'http://www.qq.com'; //'127.0.0.1';
        const time_stamp = '' + Math.ceil(Date.now() / 1000);
        const out_trade_no = `${tradeNo}`;
        const sign_type = WXPayConstants.SIGN_TYPE_MD5;

        let orderParam = {
          body,
          spbill_create_ip,
          notify_url,
          out_trade_no,
          total_fee,
          openid,
          trade_type: 'JSAPI',
          timeStamp: time_stamp,
        };

        // 调用 wx-js-utils 中的统一下单方法
        const {
          return_code,
          ...restData
        } = await pay.unifiedOrder(orderParam);

        let order_id = null;

        if (return_code === 'SUCCESS' && restData.result_code === 'SUCCESS') {
          const {
            prepay_id,
            nonce_str
          } = restData;

          // 微信小程序支付要单独进地签名，并返回给小程序端
          const sign = WXPayUtil.generateSignature({
            appId: mpAppId,
            nonceStr: nonce_str,
            package: `prepay_id=${prepay_id}`,
            signType: 'MD5',
            timeStamp: time_stamp
          }, KEY);

          let orderData = {
            out_trade_no,
            isTake: false, //商家是否接单配送
            isFinish: false, //商家是否完成配送
            time_stamp,
            nonce_str,
            address, //买家地址
            message, //买家留言,
            sendType, //配送方式
            goods,
            sign_type,
            body,
            total_fee,
            prepay_id,
            sign,
            status: 0, // 订单文档的status 0 未支付 1 已支付 2 已关闭
            _openid: openid,
          };
          let order = await orderCollection.add(orderData);
          order_id = order.id;
        }
        return new Res({
          code: return_code === 'SUCCESS' ? 0 : 1,
          data: {
            out_trade_no,
            // goods,
            total_fee,
            time_stamp,
            order_id,
            ...restData
          }
        });
      }
      // [在此处放置 payorder 的相关代码]
    case 'payorder':
      {
        // 从端里出来相关的订单相信
        const {
          out_trade_no,
          prepay_id,
          body,
          total_fee
        } = data;

        // 到微信支付侧查询是否存在该订单，并查询订单状态，看看是否已经支付成功了。
        const {
          return_code,
          ...restData
        } = await pay.orderQuery({
          out_trade_no
        });

        // 若订单存在并支付成功，则开始处理支付
        if (restData.trade_state === 'SUCCESS') {
          let result = await orderCollection
            .where({
              out_trade_no
            })
            .update({
              status: 1,
              trade_state: restData.trade_state,
              trade_state_desc: restData.trade_state_desc
            });


          let curDate = new Date();
          let time = `${curDate.getFullYear()}-${curDate.getMonth() +
          1}-${curDate.getDate()} ${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}`;

          // 调用另一个云函数，发送模板消息，通知用户已经支付成功了
          // 如果在实验中拿不到模板消息的模板 id，这段可以暂时去掉
          // let messageResult = await app.callFunction({
          //   name: 'wxmessage',
          //   data: {
          //     formId: prepay_id,
          //     openId: userInfo.openId,
          //     appId: userInfo.appId,
          //     page: `/pages/result/index?id=${out_trade_no}`,
          //     data: {
          //       keyword1: {
          //         value: out_trade_no // 订单号
          //       },
          //       keyword2: {
          //         value: body // 物品名称
          //       },
          //       keyword3: {
          //         value: time// 支付时间
          //       },
          //       keyword4: {
          //         value: (total_fee / 100) + "元" // 支付金额
          //       }
          //     }
          //   }
          // });

        }

        return new Res({
          code: return_code === 'SUCCESS' ? 0 : 1,
          data: restData
        });
      }
    case 'orderquery':
      {
        const {
          transaction_id,
          out_trade_no
        } = data;
        // 查询订单
        const {
          data: dbData
        } = await orderCollection
        .where({
          out_trade_no
        })
        .get();

        const {
          return_code,
          ...restData
        } = await pay.orderQuery({
          transaction_id,
          out_trade_no
        });

        return new Res({
          code: return_code === 'SUCCESS' ? 0 : 1,
          data: { ...restData,
            ...dbData[0]
          }
        });
      }

    case 'closeorder':
      {
        // 关闭订单
        const {
          out_trade_no
        } = data;
        const {
          return_code,
          ...restData
        } = await pay.closeOrder({
          out_trade_no
        });
        if (return_code === 'SUCCESS' &&
          restData.result_code === 'SUCCESS') {
          await orderCollection
            .where({
              out_trade_no
            })
            .update({
              status: 2,
              trade_state: 'CLOSED',
              trade_state_desc: '订单已关闭'
            });
        }

        return new Res({
          code: return_code === 'SUCCESS' ? 0 : 1,
          data: restData
        });
      }
  }
}