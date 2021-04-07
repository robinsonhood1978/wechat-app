<template>
  <Login v-if="!isLogedIn"> </Login>
  <view v-else class="page" style="padding-bottom: 100upx">
    <view class="detail-card" :class="[graceSkeleton == 'ing' ? 'grace-skeleton' : '']">
      <view class="title">追踪单号{{packageData.tracking_number}}</view>
      <view class="detail" style="margin: 20upx" v-if="packageData">
        <view class="desc" v-if="packageData.freight">所属航次：{{packageData.freight.tracking_number}}</view>
        <view class="desc">创建时间：{{formatedTime}}</view>
        <view class="desc">包裹件数：{{packageData.pieces}} 件</view>
        <view class="desc">申报价值：{{packageData.price}} 元</view>
        <view class="desc">货物体积：{{packageData.volume}} 立方米</view>
        <view class="desc">货物重量：{{packageData.net_weight}} 公斤</view>
        <view class="desc">货物材积：{{(packageData.volume/0.005).toFixed(2)}} 公斤</view>
        <view class="desc">计费重量：{{packageData.weight.toFixed(2)}} 公斤</view>
      </view>
      <view class="detail" style="margin: 20upx" v-if="packageData.source_address">
        <view class="desc">发货人员：{{packageData.source_address.firstname}} {{packageData.source_address.lastname}}</view>
        <view class="desc">发货地址：{{packageData.source_address.address}}, {{packageData.source_address.suburb}} </view>
        <view class="desc">发货城市：{{packageData.source_address.city}} {{packageData.source_address.postcode}}</view>
        <view class="desc">联系电话：{{packageData.source_address.tel}}</view>
      </view>
      <view class="detail" style="margin: 20upx" v-if="packageData.dest_address">
        <view class="desc">收货人员：{{packageData.dest_address.firstname}} {{packageData.dest_address.lastname}}</view>
        <view class="desc">收货地址：{{packageData.dest_address.address}}, {{packageData.dest_address.suburb}} </view>
        <view class="desc">目的城市：{{packageData.dest_address.city}} {{packageData.dest_address.postcode}}</view>
        <view class="desc">联系电话：{{packageData.dest_address.tel}}</view>
      </view>
      <view class="detail" style="margin: 20upx" v-if="packageData.total">
        <view class="desc">收费类型：{{packageData.charge_type.title_zh_hans}}</view>
        <view class="desc" v-for="(item, index) in packageData.operations" :key="index">{{item.type.title}}：{{item.amount}}</view>
        <view class="desc">运输费用：
          NZD ${{packageData.shipping_cost}}
          <span class="shipping-cost">(含派送费：NZD ${{packageData.dest_shipping_cost}})</span>
        </view>
        <view class="desc">总体价格：
          <span style="font-weight: bold">NZD ${{packageData.total}}</span>
        </view>
      </view>
      <div class="title" v-show="packageData.is_pickup">自提地址信息</div>
        <div class="form-field" v-show="packageData.is_pickup">
          <div>
            <radio-group>
              <label class="weui-cell weui-check__label" v-for="(item) in pickup_adds" :key="item.id">
                <radio class="weui-check" :value="item.id" :checked="item.checked" />
                <div class="weui-cell__bd" style="font-size: 0.8em">{{item.title?item.title:''}}<br v-if="item.title">
                  {{item.firstname}} {{item.lastname}} <br>
                  {{item.tel}}<br>
                  {{item.address}}, {{item.suburb}}<br>{{item.city}}, {{item.country}} {{item.postcode}}</div>
                
              </label>
            </radio-group>

          </div>
        </div>
    </view>
    <view v-if="packageData.paid" class="" >
      <button class="btn paid link"
              :send-message-title='"我要咨询运单 "+ packageData.tracking_number'
              show-message-card="true"
              bindcontact='contactCallback'
              :session-from='session_str'
              open-type='contact' >
        <p>已付款 点击咨询该运单</p>
      </button>
    </view>
    <view v-if="packageData.quote && !packageData.paid && packageData.ready_to_pay" class="">
      <button class="btn btn-sccefii nopay link" @click="showShade">
        <p>支付订单, 金额：NZD ${{packageData.quote.total}}</p>
      </button>
    </view>
    <view style="margin: 40upx"  v-if="packageData.quote && !packageData.paid && !packageData.ready_to_pay" class="">
      <p>仓库处理中......</p>
      <h1>请等待仓库处理结束后再行付款。</h1>
    </view>
    <view style="margin: 40upx"  v-if="trackingInfo.length > 0">
      <h1>追踪信息</h1>
    </view>
    <div class="package-status" v-if="trackingInfo.length > 0">
      <div class="status-box">
        <ul class="status-list">
          <li  v-for="(trackingItem, index) in trackingInfo" :key="index">
            <div class="status-content-before">{{trackingItem.create_time | dateStr}} - {{trackingItem.event }}</div>
            <!--            <div class="status-time-before">{{trackingItem.time }} </div>-->
            <!--            <div class="status-line"></div>-->
          </li>
          <li class="latest" v-if="packageData.freight && packageData.freight.eta_time">
            <div class="status-content-latest"  v-if="packageData.freight.eta_time" >{{ formatedETA }} - 预计送达</div>
            <!--            <div class="status-time-latest">{{packageData.freight.eta_time}}</div>-->
            <!--            -->
            <!--            <div class="status-line"></div>-->
          </li>
        </ul>
      </div>
    </div>
    <div class="formElement" v-if="companyInfo.show_customer_support">
      <button class="btn link inquire" hover-class="submithover" style="margin-top: 1em"
              :send-message-title='"我要咨询运单 "+ packageData.tracking_number'
              show-message-card="true"
              bindcontact='contactCallback'
              :session-from='session_str'
              open-type='contact' ><p>联系客服咨询该运单</p></button>
    </div>
    <view style="margin: 20upx"  v-if="packageData.price">
      <h1>包裹列表</h1>
    </view>
    <PackageCardDetails v-for="(packageItem) in packageData.parcels" :key="packageItem.id" :packageData="packageItem"  ></PackageCardDetails>
    <!-- 遮罩组件 @closeShade="closeShade" 实现点击关闭自身，如果不需要次功能则不绑定此事件即可 -->
    <graceShade @closeShade="closeShade" ref="graceShade" background="rgba(0, 0, 0, 0.8)">
      <view class="payments-overlay grace-relative" @tap.stop="">
        <view class="grace-accordion grace-margin-top">
          <!-- 项目0 -->
          <view class="grace-accordion-items">
            <view class="grace-accordion-title grace-border-b" id="grace-accordion-0" @tap="changeAccordion" hover-stay-time="100" hover-class="grace-opacity">
              <text class="grace-icons icon-weixin">微信支付</text>
              <text class="grace-icons icon-arrow-up" v-if="accordionActive == 'grace-accordion-0'"></text>
              <text class="grace-icons icon-arrow-down" v-else></text>
            </view>
            <view :class="['grace-accordion-body', accordionActive == 'grace-accordion-0' ? 'grace-accordion-show' : 'grace-accordion-hide']" style="font-size:0;">
              <button class="btn nopay wechatpay link" @click="wechatpay(packageData.id)">
                <p>微信支付 NZD ${{packageData.total}} </p>
              </button>
            </view>
          </view>
          <!-- 项目1 -->
          <view class="grace-accordion-items">
            <view class="grace-accordion-title grace-border-b" id="grace-accordion-1" @tap="changeAccordion" hover-stay-time="100" hover-class="grace-opacity">
              <text class="grace-icons icon-scancode">支付宝/微信扫码付款</text>
              <text class="grace-icons icon-arrow-up" v-if="accordionActive == 'grace-accordion-1'"></text>
              <text class="grace-icons icon-arrow-down" v-else></text>
            </view>
            <view :class="['grace-accordion-body', accordionActive == 'grace-accordion-1' ? 'grace-accordion-show' : 'grace-accordion-hide']" style="font-size:0;">
              <view style="margin: 30rpx">
                <text class="paymment-bank">请扫码支付NZD ${{packageData.total}}</text>
                <text class="paymment-bank paymment-bank-copy" @click="copyRef" >Reference: {{packageData.tracking_number}}</text>
                <h3 style="font-size:0.6rem">点击复制备注信息,为了加速处理流程，请支付后截图发给客服存档。</h3>
              </view>
              <image src="/static/images/ATL-Latipay.png" style="width:100%;" mode="widthFix"></image>
            </view>
          </view>
          <!-- 项目2 -->
          <view class="grace-accordion-items">
            <view class="grace-accordion-title grace-border-b" id="grace-accordion-2" @tap="changeAccordion" hover-stay-time="100" hover-class="grace-opacity">
              <text class="grace-icons icon-wallet">银行转账付款</text>
              <text class="grace-icons icon-arrow-up" v-if="accordionActive == 'grace-accordion-2'"></text>
              <text class="grace-icons icon-arrow-down" v-else></text>
            </view>
            <view :class="['grace-accordion-body', accordionActive == 'grace-accordion-2' ? 'grace-accordion-show' : 'grace-accordion-hide']">
              <view style="margin: 30rpx">
              <text class="paymment-bank">请转账 NZD ${{packageData.total}} 至以下账号</text>
              <text class="paymment-bank">银行账户名：Aion Technologies Ltd</text>
              <text class="paymment-bank paymment-bank-copy" @click="copyBank">银行账户号：02-1244-0178838-000</text>
              <text class="paymment-bank paymment-bank-copy" @click="copyRef" >Reference: {{packageData.tracking_number}}</text>
              <h3 style="font-size:0.6rem">点击复制银行账号及备注信息,为了加速处理流程，请支付后截图发给客服存档。</h3>
              </view>
            </view>
          </view>
        </view>
        <h3 style="color:white;font-size:0.6rem"> 支付完成后，仓库会进行处理，如有问题或其他费用客服将遵循多退少补原则联系您协商解决,请务必选择最合适的收费类型以避免不必要的延误。</h3>
        <button class="btn link inquire" hover-class="submithover" style="margin-top: 1em"
              :send-message-title='"我要咨询运单 "+ packageData.tracking_number'
              show-message-card="true"
              bindcontact='contactCallback'
              :session-from='session_str'
              open-type='contact' ><p>联系客服咨询该运单</p></button>
        <view class="close-btn grace-icons icon-close3 grace-white grace-absolute-rt" @tap.stop="closeShade"></view>
      </view>
    </graceShade>
    <mp-modal ref="copyModalRef" title="确认复制" content="是否确认复制Reference？当前剪贴板内容将被覆盖。" :showCancel="true" @confirm="confirmCopyRef" ></mp-modal>
    <mp-modal ref="copyModalBank" title="确认复制" content="是否确认复制银行账号？当前剪贴板内容将被覆盖。" :showCancel="true" @confirm="confirmCopyBank" ></mp-modal>
  </view>
</template>

<script>
import { apiHost, get, showSuccess, showFail, post } from '@/utils/index'
import moment from 'moment'
import { mapState } from 'vuex'
import PackageCardDetails from '@/components/package-card-detail'
import Login from '@/components/login'
import graceShade from "../../graceUI/components/graceShade.vue";
import mpModal from 'mpvue-weui/src/modal'
export default {
  components: {
    Login,
    PackageCardDetails,
    graceShade,
    mpModal
  },
  data () {
    return {
      pickup_adds: null,
      accordionActive: "grace-accordion-0",
      graceSkeleton: 'ing',
      packageId: 0,
      host: apiHost,
      images: [],
      thumbs: [],
      name: '未知用户',
      formData: {
        id: '',
        title: '',
        customer_note: '',
        titles: [],
        quantities: [],
        totals: [],
        materials: []
      },
      items: [],
      item: {
        reference: '',
        quantity: 1,
        title: '',
        subtotal: '',
        total: '',
        totalstr: 0.00
      },
      canBack: true,
      trackingInfo: [],
      packageData: {
        tracking_number: 'Loading...'
      },
      needToPay: false
    }
  },
  computed: {
    ...mapState([
      'userInfo',
      'isLogedIn',
      'userProfile',
      'companyID',
      'appOptions',
      'companyInfo'
    ]),
    session_str () {
      if (!this.isLogedIn) {
        return ''
      } else if (this.userProfile.customer) {
        return '{"nickName":"' + this.userInfo.nickName + '-' + this.userProfile.customer.applicant_number + '","avatarUrl":"' + this.userInfo.avatarUrl + '","note":"' + this.packageData.tracking_number + '"}'
      } else {
        return '{"nickName":"' + this.userInfo.nickName + '","avatarUrl":"' + this.userInfo.avatarUrl + '","note":"' + this.packageData.tracking_number + '"}'
      }
    },
    total_price () {
      var total = 0
      if (this.items) {
        this.items.forEach(function (i) {
          total += (parseFloat(i.subtotal) || 0)
        })
        return total.toFixed(2)
      }
      return 0
    },
    formatedTime () {
      return moment(this.packageData.create_time).local().format('DD/MM/YYYY')
    },
    formatedETA () {
      if (this.packageData.freight) {
        return moment(this.packageData.freight.eta_time).local().format('DD/MM/YYYY')
      } else {
        return ''
      }
    },
    // volume () {
    //   return this.packageData.net_volume ? (this.packageData.net_volume.toFixed(3)) : 0
    // },
    formatedSendoutTime () {
      if (this.packageData.in_freight) {
        return this.packageData.in_freight.sent_time ? moment(this.packageData.in_freight.sent_time).local().format('DD/MM/YYYY HH:mm') : ''
      } else {
        return ''
      }
    }
  },
  watch: {
    isLogedIn: function () {
      if (this.isLogedIn) {
        this.loadData()
      }
    }
  },
  onShow () {
    if (this.appOptions.scene === 1043) {
      this.canBack = false
    }
    console.log('canBack ' + this.canBack)
  },
  mounted () {
    this.pickup_adds = this.userProfile.company.pickup_addresses
    this.packageId = this.$root.$mp.query.id
    console.log('Package ID: ' + this.packageId)
    if (this.isLogedIn) {
      this.loadData()
    }
    var notify = this.$root.$mp.query.notify
    console.log(notify)
    if (notify) {
      showSuccess('运单生成成功,请付款')
    }
    var pay = this.$root.$mp.query.pay
    console.log(pay)
    if (pay) {
      this.needToPay = pay
    }
  },
  methods: {
    predivImage (e) {
      console.log(e)
      wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: this.images// 需要预览的图片http链接列表
      })
    },
    async loadData () {
      if (this.packageId === 0) {
        return
      }
      wx.showLoading({ title: '加载中...', mask: true })
      console.log('Get Customer Parcel Detail...')
      let resp = await get('freightorders/' + this.packageId + '/')
      console.log(resp)
      this.packageData = resp
      console.log(this.packageData)
      wx.setNavigationBarTitle({
        title: this.packageData.tracking_number ? this.packageData.tracking_number : '无标题'
      })
      if (this.packageData.user) {
        this.name = this.packageData.user.first_name + ' ' + this.packageData.user.last_name +
            ' - ' + this.packageData.user.applicant_number
      }
      // this.volume = parseInt(parseFloat(this.packageData.volume) * 100 + 1)/100
      this.volume = (parseInt(this.packageData.volume * 100) / 100 !== this.packageData.volume) ? parseInt(this.packageData.volume * 100) / 100 + 0.01 : (parseInt(this.packageData.volume * 100) / 100)
      this.formData.customer_note = this.packageData.customer_note ? this.packageData.customer_note : ''
      this.formData.title = this.packageData.title
      this.items = this.packageData.orderdetail_set
      if (this.items && this.items.length === 0) {
        this.items.push(this.item)
      }
      this.formData.id = this.packageId
      this.trackingInfo = this.packageData.tracking_info
      console.log(this.trackingInfo)
      // 骨架屏规划后延长 500 毫秒进行数据替换
      setTimeout(() => {
        this.graceSkeleton = 'end'
      }, 500)
      wx.hideLoading()
      if(this.needToPay){
        this.needToPay = false
        this.showShade()
      }
    },
    resetData () {
      this.packageData = []
      this.images = []
      this.packageId = 0
      this.thumbs = []
      this.name = ''
      this.formData = {
        title: '',
        customer_note: '',
        titles: [],
        quantities: [],
        totals: [],
        materials: []
      }
      this.items = []
      this.item = {
        id: 0,
        reference: '',
        quantity: 1,
        title: '',
        subtotal: '',
        total: '',
        totalstr: 0.00
      }
    },
    async wechatpay (id) {
      var data = {
        oid: id
      }
      let header = { 'Content-Type': 'application/json' }
      let resp = await post('packgo/latipay/', data, header)
      console.log(resp)
      let _this = this
      wx.requestPayment({
        ...resp,
        success: function (res) {
          console.log(res)
          _this.closeShade()
          setTimeout(showSuccess, 500, '支付成功')
          _this.loadData()
        },
        fail (res) {
          console.log(res)
          showFail("支付失败，请选择其他途径")
        }
      })
      // wx.navigateToMiniProgram({
      //   appId: 'wxd732cfc71e3d35ec',
      //   path: 'page/home',
      //   extraData: {
      //     foo: 'bar'
      //   },
      //   envVersion: 'release',
      //   success(res) {
      //     // 打开成功
      //   }
      // })
    },
    showShade : function () {
      if(this.packageData.paid){
        showFail("已经支付，请勿重复支付")
        return
      } 
      this.$refs.graceShade.showIt();
    },
    closeShade : function () {
      this.$refs.graceShade.hideIt();
    },
    changeAccordion : function(e){
      var accordionIndex = e.currentTarget.id;
      if (this.accordionActive == accordionIndex){accordionIndex = '';}
      this.accordionActive = accordionIndex;
    },
    copyRef () {
      this.$refs.copyModalRef.show()
    },
    confirmCopyRef () {
      wx.setClipboardData({
        data: this.packageData.tracking_number,
        success (res) {
          wx.getClipboardData({
            success (res) {
              console.log(res.data) // data
              showSuccess("运单号已复制")
            }
          })
        }
      })
    },
    copyBank () {
      this.$refs.copyModalBank.show()
    },
    confirmCopyBank () {
      wx.setClipboardData({
        data: "02-1244-0178838-000",
        success (res) {
          wx.getClipboardData({
            success (res) {
              console.log(res.data) // data
              showSuccess("帐号已复制")
            }
          })
        }
      })
    }

  },
  onUnload () {
    this.resetData()
  }
}
</script>
<style scoped lang="scss">
  p {
    font-size: 36upx;
  }
  .parcel-list{
    margin-left: -40upx;
    margin-right:-40upx;
  }
  .btn {
    height: 100rpx;
    width: 80%;
    margin: 10rpx auto;
    background-color: $uni-color-warning;
    color: white;
    width: 80%;
    box-shadow: 0px 4px 16px #455B6308;
    border-radius: 3px;
    text-align: center;
    color: white;
    display: flex;
  }
  .paid {
    background-color: $theme-color;
  }
  .nopay {
    background-color: $uni-color-warning;
  }
  .link {
    vertical-align: middle;
    p {
      padding: 10px;
      font-size: 0.8em;
      font-weight: bold;
      margin: auto;
      color: white;
    }
  }
  .detail-card {
    background-color: white;
    padding-top: 10upx;
    padding-bottom: 20upx;
    .title {
      font-size: 1.3em;
      font-weight: bold;
      margin: 20upx;
      border-bottom-width: 1px;
      border-bottom-style: solid;
      border-bottom-color: #9b9b9b;
      color: $theme-color;
    }
    .desc {
      font-size: 0.8em;
      color: #626262;
    }
  }
  .detail {
    margin: 20upx;
    align-items:center;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: #9b9b9b;
    padding-top: 10upx;
    padding-bottom: 20upx;
    color: #626262;

    h1 {
      width: 30%;
      font-size: 32upx;
      font-weight: bold;
    }
    p {
      width: 70%;
      margin-bottom: 0;
      font-size: 36upx;
    }
    .line-section {
      p{
        font-size: 1em;
        margin-bottom: 10upx;
      }
      .item-title {
        width: 30%;
      }

      .item-caizhi {
        width: 30%;
      }

      .item-pieces {
        width: 20%;
      }

      .item-price {
        width: 30%;
      }
    }
    .icon {
      color: $uni-color-primary;
    }
  }
  p {
    font-size: 36rpx;
  }
  .detail-container{
    margin: 1em;
    overflow-x:hidden;
    white-space:nowrap;
  }
  .shipping-cost {
    font-size: 0.7em;
    margin-left: 2em;
  }
  .package-status {
    background: white;
    margin: 30upx;
    padding: 30upx;
    ul li {
      list-style: none;
    }

    .package-status {
      padding: 18px 0 0 0
    }

    .status-list {
      margin: 0;
      padding: 0;
      margin-top: -5px;
      padding-left: 8px;
      list-style: none;
    }

    .status-list > li {
      border-left: 2px solid $theme-color;
      text-align: left;
    }

    .status-list > li:before {
      /* 流程点的样式 */
      content: '';
      border: 3px solid $theme-color;
      background-color: $theme-color;
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 10px;
      margin-left: -7px;
      margin-right: 10px
    }

    .status-box {
      overflow: hidden
    }

    .status-list > li {
      height: auto;
      width: 95%;
    }

    .status-list {
      margin-top: -8px
    }

    .status-box {
      position: relative
    }

    .status-box:before {
      content: " ";
      background-color: #f3f3f3;
      display: block;
      position: absolute;
      top: -8px;
      left: 20px;
      width: 10px;
      height: 4px
    }

    .status-list {
      margin-top: 0px;
    }

    .status-list > li:not(:first-child) {
      padding-top: 10px;
    }

    .status-content-before {
      text-align: left;
      margin-left: 25px;
      margin-top: -20px;
    }

    .status-content-latest {
      text-align: left;
      margin-left: 25px;
      color: $theme-color;
      margin-top: -20px;
    }

    .status-time-before {
      text-align: left;
      margin-left: 25px;
      font-size: 10px;
      margin-top: 5px;
    }

    .status-time-latest {
      text-align: left;
      margin-left: 25px;
      color: $theme-color;
      font-size: 10px;
      margin-top: 5px;
    }

    .status-line {
      border-bottom: 1px solid #ccc;
      margin-left: 25px;
      margin-top: 10px;
    }

    .list {
      padding: 0 20px;
      background-color: #F8F8F8;
      margin: 10px 0 0 25px;
      border: 1px solid #EBEBEB;
      li {
        line-height: 30px;
        color: #616161;
      }
    }
  }
  .no-style {
    color: white;
    padding:10px;
    background-color: unset;
    line-height: unset;
    font-size: unset;
    padding: unset;
    &:after {
      border-width: 0;
    }
    &:hover {
      background-color: unset;
    }
  }
  .button-hover {
    background-color: unset;
  }
  .inquire {
    background-color: $uni-color-error;
  }
  .payments-overlay{width:500rpx; font-size:0; padding: 50rpx 20rpx;}
  .payments-overlay-in{width:500rpx; height:800rpx;}
  .close-btn{width:80rpx; height:80rpx; line-height:80rpx; text-align:center; font-size:40rpx; z-index:7;}
  .wechatpay {
    background-color: RGBA(129, 211, 117, 1.00);
    color: white;
    vertical-align: center;
    horizontal-align: center;
    margin: 30rpx auto;
  }
  .wechatpay-icon {
    width: 50rpx;
    display: inline;
    margin: auto 0px;
    margin-right: 50rpx;
  }
  .wechatpay-text {

  }
  .paymment-bank {
    display: block;
    margin: 10rpx 0;
  }
  .paymment-bank-copy {
    text-decoration: underline;
  }
  
  .grace-accordion-show{height:auto; animation:fadeIn 300ms linear;}
  .grace-accordion-hide{height:0; animation:fadeOut 300ms linear;}
  .grace-accordion-title{color:#323232; background:#F8F8F8;}
  .grace-accordion-title .grace-icons:before{margin-right:15rpx; font-size:36rpx !important;}
</style>
