<template>
  <view class="grace-body">
<!--    <Login v-if="!isLogedIn"> </Login>-->
<!--    <view v-else class="grace-margin">-->
      <view class="grace-margin" style="margin-top: 15px">
<!--      <view class="grace-h3" style="margin-top:15px;">-->
<!--        个人中心-->
<!--      </view>-->
      <view class="grace-list" style="margin-top:3px;">
        <view class="grace-list-items">
<!--          <view class="icons ucenter-face">-->
<!--            <image  class="ucenter-face-image" :src="userInfo.avatarUrl"  mode="widthFix"></image>-->
<!--          </view>-->
          <view class="grace-list-image ucenter-face grace-relative">
            <image class="grace-list-image ucenter-face-image" :src="userInfo.avatarUrl" mode="widthFix"></image>
          </view>
          <view class="grace-list-body">
            <view class="title"><span>{{userInfo.nickName?userInfo.nickName:"未注册"}} <view v-if="userProfile.is_staff" class="admin">ADMIN</view> </span></view>
            <view  class="desc">  会员号: {{ userProfile.customer.applicant_number?userProfile.customer.applicant_number:"请注册"}} </view>
          </view>
        </view>
      </view>
      <view class="grace-grids demoForIcon  grids-border-wrap grace-margin-top">
        <navigator class="grace-grids-items items" url="/pages/common/about">
          <view class="grace-grids-icon">
            <text class="yunicon icon-yun yun-icon-logo"></text>
          </view>
          <view class="grace-grids-text">关于我们</view>
        </navigator>
        <navigator class="grace-grids-items items"  url="/pages/fees/details">
          <view class="grace-grids-icon">
            <text class="yunicon icon-dollar yunicon-large"></text>
          </view>
          <view class="text">运费说明</view>
        </navigator>
        <navigator class="grace-grids-items items" url="/pages/common/faq">
          <view class="grace-grids-icon">
            <text class="yunicon icon-faq yunicon-large"></text>
          </view>
          <view class="text">常见问题</view>
        </navigator>
        <navigator class="grace-grids-items items" url="/pages/common/keyWords">
          <view class="grace-grids-icon">
            <text class="yunicon icon-terms-round yunicon-large"></text>
          </view>
          <view class="text">常用名词</view>
        </navigator>
<!--        <navigator class="grace-grids-items items" url="/pages/common/onePrice">-->
        <navigator class="grace-grids-items items" url="/pages/common/vouchers">
          <view class="grace-grids-icon">
            <text class="grace-icons icon-wallet  yunicon-large"></text>
          </view>
          <view class="text">卡券</view>
        </navigator>
        <navigator class="grace-grids-items items"  url="/pages/common/payments">
          <view class="grace-grids-icon">
            <text class="yunicon icon-pay yunicon-large"></text>
          </view>
          <view class="text">支付方式</view>
        </navigator>
        <navigator class="grace-grids-items items" open-type="switchTab" url="/pages/fees/feesCalc">
          <view class="grace-grids-icon">
            <text class="yunicon icon-calc yunicon-large"></text>
          </view>
          <view class="text">运费计算</view>
        </navigator>
        <button class="grace-grids-items items no-style"
                v-if="companyInfo.show_customer_support"
                send-message-title="常见问题"
                show-message-card="true"
                bindcontact='contactCallback'
                :session-from='session_str'
                open-type='contact'>
          <view class="grace-grids-icon">
            <text class="yunicon icon-support yunicon-large"></text>
          </view>
          <view class="text">联系客服</view>
        </button>
        <navigator v-else class="grace-grids-items items" url="/pages/common/contact">
          <view class="grace-grids-icon">
            <text class="yunicon icon-support yunicon-large"></text>
          </view>
          <view class="text">联系客服</view>
        </navigator>
      </view>
      <view style="margin-top: 15px">
        <view class="grace-list"  v-if="!userProfile.is_customer">
          <navigator v-if="isLogedIn" class="grace-list-items" bindtap="updateInfo" >
            <view class="grace-list-icon grace-icons icon-friend grace-blue"></view>
            <view class="grace-list-body">
              <view class="title">完善信息获取集运地址</view>
            </view>
            <view class="grace-list-arrow-right grace-icons icon-arrow-right"></view>
          </navigator>
          <navigator v-if="!isLogedIn" class="grace-list-items" >
            <button   class="authbutton" open-type="getUserInfo" @getuserinfo="bindgetuserinfo">开始 <view class="icon yunicon icon-yun logo" style="display: inline-block"/> | 运过来</button>
          </navigator>
        </view>
        <view class="grace-list"  v-else>
<!--          <view @click="shomessage">-->
<!--            <view class="icons grace-icons icon-user grace-red"></view>-->
<!--            <view class="body">-->
<!--              <view class="title">个人信息管理</view>-->
<!--            </view>-->
<!--            <view class="arrow-right"></view>-->
<!--          </view>-->
          <navigator class="grace-list-items"  url="/pages/weblogin?tab=0&update=true">
            <text class="grace-list-icon grace-icons icon-user grace-red"></text>
            <view class="grace-list-body">
              <view class="grace-list-title">个人信息管理</view>
            </view>
            <view class="grace-list-arrow-right grace-icons icon-arrow-right"></view>
          </navigator>
          <view class="ucenter-line"></view>
          <navigator class="grace-list-items"  url="/pages/common/address">
            <view class="grace-list-icon grace-icons icon-address grace-red"></view>
            <view class="grace-list-body">
              <view class="title">收件人地址管理</view>
            </view>
            <view class="grace-list-arrow-right grace-icons icon-arrow-right"></view>
          </navigator>
          <view class="ucenter-line"></view>
          <!--          <navigator class="items"  url="/pages/common/senderAddress">-->
          <navigator class="grace-list-items"  url="/pages/common/address?is_sender=true">
            <view class="grace-list-icon grace-icons icon-address grace-red"></view>
            <view class="grace-list-body">
              <view class="title">发件人地址管理</view>
            </view>
            <view class="grace-list-arrow-right grace-icons icon-arrow-right"></view>
          </navigator>
          <view class="ucenter-line"></view>
        </view>
      </view>
      <view class="grace-margin-top" style="background: white; padding-top: 20upx; padding-bottom: 20upx">
        <addressCn></addressCn>
        <navigator class="terms" url="/pages/common/terms">《客户服务条款》</navigator>
      </view>

    <mp-modal ref="mpModal" title="解除绑定" content="是否确认解绑网站用户？" :showCancel="true" @confirm="confirm" @cancel="cancel"></mp-modal>

    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
// import Login from '@/components/login'
import mpModal from 'mpvue-weui/src/modal'
import { get, appid, login, showSuccess, post } from '@/utils/index'
import addressCn from '@/components/addressCn'
export default {
  computed: {
    ...mapState([
      'userInfo',
      'isLogedIn',
      'userProfile',
      'CID',
      'companyInfo'
    ]),
    data () {
      return {
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        gridData: [
          { src: '/static/icons/home.png', name: 'Home', url: '/pages/button/main' },
          { src: '/static/icons/calc.png', name: 'Button', url: '/pages/button/main' },
          { src: '/static/icons/calc.png', name: 'Calc', url: '/pages/button/main' }
        ],
        icons: [
          'wifi', 'face', 'address', 'tel', 'voice', 'photograph', 'microphone', 'keyboard',
          'share', 'share2', 'share3', 'share', 'shoppingcard', 'position', 'safe', 'eye',
          'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down', 'time', 'time2', 'home', 'back',
          'star', 'zan', 'comments', 'write', 'weibo', 'weixin', 'qq', 'remove',
          'search', 'close', 'close2', 'close3', 'refresh', 'loading', 'shoucang', 'boy', 'girl'
        ]
      }
    },
    session_str () {
      if (this.isLogedIn && this.userProfile && this.userProfile.is_customer) {
        return '{"nickName":"' + this.userInfo.nickName + '-' + this.userProfile.customer.applicant_number + '","avatarUrl":"' + this.userInfo.avatarUrl + '"}'
      } else {
        return '{"nickName":"' + this.userInfo.nickName + '","avatarUrl":"' + this.userInfo.avatarUrl + '"}'
      }
    },
    display_address () {
      if (this.userProfile.customer && this.userProfile.customer.address_cn) {
        return this.userProfile.customer.address_cn.split('，')
      }
      return []
    }
  },
  components: {
    // Login,
    mpModal,
    addressCn
  },
  watch: {
    // isLogedIn () {
    //   if (this.isLogedIn) {
    //     uni.showTabBar()
    //   } else {
    //     uni.hideTabBar()
    //   }
    // }
  },
  onShow () {
    uni.showTabBar()
    // if (this.isLogedIn) {
    //   uni.showTabBar()
    // } else {
    //   uni.hideTabBar()
    // }
  },
  methods: {
    bindgetuserinfo (e) {
      console.log(e)
      this.userInfo = e.mp.detail.userInfo
      this.getUserInfo()
    },
    getUserInfo () {
      var self = this
      login({
        success: function () {
          wx.hideLoading()
          showSuccess('登陆成功')
          self.updateInfo()
        },
        fail: function () {
          wx.hideLoading()
        }
      })
    },
    openContact () {
      let url = '/pages/common/contact'
      wx.navigateTo({ url })
    },
    copyAddress () {
      this.$refs.copyModal.show()
    },
    confirmCopy () {
      wx.setClipboardData({
        data: this.userProfile.customer.address_cn,
        success (res) {
          wx.getClipboardData({
            success (res) {
              console.log(res.data) // data
              showSuccess('复制成功')
            }
          })
        }
      })
    },
    terms () {
      let url = '/pages/common/terms'
      wx.navigateTo({ url })
    },
    weblogin () {
      let url = '/pages/weblogin?tab=1'
      wx.navigateTo({ url })
    },
    updateInfo () {
      let url = '/pages/weblogin?tab=0'
      wx.navigateTo({ url })
    },
    weblogout () {
      this.$refs.mpModal.show()
    },
    gotoSchedulePage () {
      let url = '/pages/schedules/schedules'
      wx.navigateTo({ url })
    },
    async wechatpay () {
      var data = {
        amount: '0.01',
        product_name: 'Ticket'
      }
      let header = { 'Content-Type': 'application/json' }
      let resp = post('store/pay/latipay/12/', data, header)
      console.log(resp)
      wx.requestPayment({
        ...resp,
        success: function (res) {
          console.log(res)
        }
      })
    },
    async confirm () {
      wx.showLoading({ title: '正在解绑...', mask: true })
      let res = get('freightcustomers/logout/?appid=' + appid)
      console.log(res)
      res.then(v => {
        if (v.code === 0) {
          login({
            success: function () {
              wx.hideLoading()
              showSuccess('解绑成功')
              wx.navigateBack()
            },
            fail: function () {
              wx.hideLoading()
            }
          })
        }
      })
    },
    shomessage () {
      uni.requestSubscribeMessage({
        tmplIds: ['GPtAQk0USqPs5-r6uU9tGPHJcFfsw2yNA0yVRyqsxTY'],
        success: (res) => {
          console.log('订阅消息 成功 ' + res)
        },
        fail: (errCode, errMessage) => {
          console.log(errCode)
        },
        complete: (errMsg) => {
          console.log(errMsg)
        }

      })
    }
  }
}
</script>

<style scoped lang="scss">
  .ucenter-face{width:120upx !important; height:120upx !important;}
  .ucenter-face image{width:120upx !important; height:120upx !important;}
  .admin {
    display: inline-block;
    font-size: 0.7em;
    color:#AB0009;
    font-weight: bold;
  }
  .userinfo-avatar {
    border-radius: 50%;
  }
  .login-name{
    font-size:1em;
  }
  .authbutton{
    margin:50px 30px 20px;
  }
  .setting-group {
    margin-top: 50px;
  }
  .contact-panel{
    margin-top: 60px;
  }
  .help-panel{
    margin-top: 30px;
  }
  .contact {
    margin-top: 100rpx;
    background: $theme-color;
    color: white;
    width: 70%;
    &:hover {
      background: $secondary-color;
    }
  }
  .address {
    margin: 20px 5px;
    padding: 5px 20px;
    background: #f9f9f9f9;
    span{
      font-size: 0.6em;
    }
    p {
      font-size: 0.8em;
      font-weight: bold;
    }
  }
  .address-hover {
    background: #999999;
  }
  .terms{
    text-align: center;
    margin: 20px auto;
    font-size: 0.8em;
    font-weight: bold;
    color: $theme-color;
  }
  .grace-grids{border-right:2upx solid #F8F8F8; border-bottom:2upx solid #F5F6F8;}
  .grace-grids .items{width:25%; box-sizing:border-box; background:#FFF; border-left:2upx solid #F8F8F8; border-top:2upx solid #F5F6F8;}
  .ucenter-line{height:12rpx; background-color:#F4F5F6; margin:16rpx 0;}
  .yunicon-large {
    font-size: 30px;
  }
  .five > .items{width:20%;}
  .demoForIcon{border-right:2rpx solid #F5F6F8; border-bottom:2rpx solid #F5F6F8;}
  .demoForIcon > .items{border-left:2rpx solid #F5F6F8; border-top:2rpx solid #F5F6F8;}
  .grace-list {background: white}
  .yun-icon-logo {font-size: 40upx !important;}
  .grace-list > .items { display: flex }
  .no-style {
    background-color: white;
    border-width: 0;
    line-height: unset;
    color: unset;
    &:after {
      border-width: 0;
      border-radius: unset;
    }

  }
  .logo {
    color: white;
    font-size: 1.3em;
    margin-left: 0.3em;
    margin-right: 0.3em;
  }
  .authbutton{
    margin: 40upx auto;
    width: 350upx;
    padding: 3upx;
    background-color: $theme-color;
    color: white;
    border-style: none;
    font-size: 1em;
    box-shadow: 0px 4px 16px #455B6308;
    border-radius: 3px;
    &:hover {
      background: $secondary-color;
    }
  }
</style>
