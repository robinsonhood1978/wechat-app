<template>
  <Login v-if="!isLogedIn"> </Login>
  <view v-else class="page" style="padding-bottom: 100upx">
    <swiper class="grace-swiper"
            autoplay="true" indicator-dots
            indicator-color="rgba(255, 255, 255, 1)"
            indicator-active-color="#3688FF"
            style="height:500upx;background-color: white"
            interval="3000">

      <swiper-item  v-for="(thumb, index) in images" :key="index" class="lightbox__holder" @click="predivImage" :id="images[index]">
        <image style="height:100%;width:100%" :src="thumb" mode="aspectFill" />
      </swiper-item>
    </swiper>
    <view class="detail-card">
      <view class="title">{{packageData.local_courier_name}} {{packageData.local_courier_number}}</view>
      <view style="margin: 20upx">
        <view class="desc">收货时间：{{formatedTime}}</view>
        <view class="desc">物品件数：{{packageData.pieces}} 件</view>
        <view class="desc">货物体积：{{volume}} m3</view>
        <view class="desc">货物重量：{{packageData.weight}} KG</view>
        <view class="desc">材积：{{volWeightFlight}} KG </view>
        <view v-if="packageData.dform" class="desc">
          所属运单：<navigator style="display: inline-block; color: red; font-weight:bold" :url="'/pages/freightorders/details?id=' + packageData.dform.id">
            {{packageData.dform.tracking_number }} 
          </navigator> (点击查看详情)
        </view>
      </view>
    </view>
    <view style="background-color: white">
    <view class="detail" >
        <view :key="index" v-for="(item, index) in items">
          <view class="grace-rows grace-nowrap line-section">
            <view class=" item-title">
              <p v-if="index == 0">物品名称</p>
              <input type="text" class="" v-model="item.title" placeholder="请填写" :disabled="disabled"/>
            </view>
            <view class="item-caizhi">
              <p v-if="index == 0">材质</p>
              <input type="text" class="" v-model.number="item.reference" placeholder="请填写" :disabled="disabled"/>
            </view>
            <view class="item-pieces">
              <p v-if="index == 0">件数</p>
              <input type="digit" class="" v-model.number="item.quantity" placeholder="0" :disabled="disabled"/>
            </view>
            <view class="item-price">
              <p v-if="index == 0">总价(¥)</p>
              <input type="digit" class="" v-model.number="item.subtotal" placeholder="CNY" :disabled="disabled"/>
            </view>
            <view class="item-pieces" v-if="items.length >= 2">
              <p v-if="index == 0">删除</p>
              <p @click="del_item(index)" v-if="!disabled"><view class="yunicon icon-remove icon" ></view></p>
            </view>
          </view>
      </view>
    </view>

    <div class="detail grace-nowrap total-row ">
      <p>货物总价: CNY ¥ {{total_price}}</p>
      <view  @click="add_item" :disabled="disabled"><view class="yunicon icon-add icon"></view></view>
    </div>
    <div class="detail item-notice">**请每行单独填写详细的物品名称，材质和最小包装数量(如衣服10件，炒开心果5包，乌龙茶3盒)，请勿多品名写在一行，品名请勿填写日用品/生活用品/食品/茶叶等概括性名称或者品牌如“三只松鼠”，混合材质请写明具体材质，例如塑料，金属等，以免误导耽误清关报关。</div>
    <view class="grace-nowrap" style="margin: 20upx; margin-top: 40upx;padding-bottom: 40upx">
      <view style="font-size: 1em; width: 25%">客户备注：</view>
      <textarea class="notes" placeholder="请输入备注" v-model="formData.customer_note"  cursor-spacing="1em"/>
    </view>
    </view>
      <button class="submit" hover-class="submithover" style="margin-top: 1em" @click="submitBack" :disabled="disabled">提交并返回</button>
      <button class="submit inquire" hover-class="submithover" style="margin-top: 1em"
              v-if="companyInfo.show_customer_support"
            :send-message-title='"我要咨询包裹 "+ packageData.tracking_number'
            show-message-card="true"
            bindcontact='contactCallback'
            :session-from='session_str'
            open-type='contact' >咨询该包裹</button>
  </view>
</template>

<script>
import { apiHost, get, showSuccess, showFail, post } from '@/utils/index'
import moment from 'moment'
import { mapState } from 'vuex'
import event from '@/utils/event'
import Login from '@/components/login'
export default {
  components: {
    Login
  },
  data () {
    return {
      packageId: 0,
      packageData: {},
      host: apiHost,
      images: [],
      thumbs: [],
      name: '未知用户',
      volume: 0,
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
        quantity: 0,
        title: '',
        subtotal: '',
        total: '',
        totalstr: 0.00
      },
      canBack: true,
      fobiden_list:"日用品/生活用品/食品/茶叶/三只松鼠"
    }
  },
  computed: {
    ...mapState([
      'isLogedIn',
      'userProfile',
      'CID',
      'userInfo',
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
    disabled () {
      return (this.packageData.dform && this.packageData.dform.paid)
    },
    total_price () {
      var total = 0
      this.items.forEach(function (i) {
        // let price = parseFloat(i.price)
        // let pieces = parseFloat(i.quantity)
        // i.subtotal = price * pieces
        // i.totalStr = i.subtotal.toFixed(2)
        total += (parseFloat(i.subtotal) || 0)
      })
      return total.toFixed(2)
    },
    formatedTime () {
      return moment(this.packageData.receive_time).local().format('DD/MM/YYYY HH:mm')
    },
    volWeight () {
      return (this.packageData.volume / 0.006).toFixed(2)
    },
    volWeightFlight () {
      return (this.packageData.volume / 0.005).toFixed(2)
    },
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
    this.packageId = this.$root.$mp.query.id
    console.log('Package ID: ' + this.packageId)
    if (this.isLogedIn) {
      this.loadData()
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
      console.log('Get Customer Parcel Detail...')
      let resp = await get('parcels/' + this.packageId + '/')

      this.packageData = resp
      console.log(this.packageData)
      wx.setNavigationBarTitle({
        title: this.packageData.title ? this.packageData.title : '无标题'
      })
      this.images = this.packageData.images.map((item) => {
        return item.url.startsWith('http') ? item.url : (this.host + 'media/' + item.url)
        // return item.url
      })
      this.thumbs = this.packageData.images.map((item) => {
        return item.thumb.startsWith('http') ? item.thumb : (this.host + 'media/' + item.thumb)
        // return item.thumb
      })
      if (this.packageData.user) {
        this.name = this.packageData.user.first_name + ' ' + this.packageData.user.last_name +
            ' - ' + this.packageData.user.applicant_number
      }
      // this.volume = parseInt(parseFloat(this.packageData.volume) * 100 + 1)/100
      // this.volume = (parseInt(this.packageData.volume * 100) / 100 !== this.packageData.volume) ? parseInt(this.packageData.volume * 100) / 100 + 0.01 : (parseInt(this.packageData.volume * 100) / 100)
      this.volume = this.packageData.volume.toFixed(3)
      this.formData.customer_note = this.packageData.customer_note ? this.packageData.customer_note : ''
      this.formData.title = this.packageData.title
      this.items = this.packageData.orderdetail_set
      if (this.items.length === 0) {
        this.items.push(this.item)
      }
      this.formData.id = this.packageId
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
    async add_item () {
      var item = {
        id: 0,
        title: '',
        quantity: 1,
        reference: '',
        price: 0,
        subtotal: '',
        totalstr: 0.00
      }
      this.items.push(item)
      console.log(this.items)
    },
    async del_item (e) {
      // var size = JSON.parse(JSON.stringify(this.sizes[this.sizes.length - 1]))
      //
      // this.sizes.push(size)
      this.items.splice(e, 1)
      console.log(e)
    },
    async submit () {
      wx.showLoading({ title: '提交中...', mask: true })
      var errid = 0
      try {
        this.formData.titles = []
        this.formData.materials = []
        this.formData.quantities = []
        this.formData.totals = []
        this.items.forEach((item) => {
          if (item.title != '' && this.fobiden_list.includes(item.title)) {
            throw Error('Title')
          } 
          if (item.reference === '混合') {
            throw Error('Materials')
          }
          if (item.title === '' || item.quantity === '' || item.subtotal === '' || item.reference === '') {
            throw Error('Info')
          }

          this.formData.titles.push(item.title)
          this.formData.quantities.push(item.quantity)
          this.formData.materials.push(item.reference)
          this.formData.totals.push(item.subtotal)
        })
        this.formData.titles = JSON.stringify(this.formData.titles)
        this.formData.quantities = JSON.stringify(this.formData.quantities)
        this.formData.materials = JSON.stringify(this.formData.materials)
        this.formData.totals = JSON.stringify(this.formData.totals)

        console.log(this.formData)
        // let myformdata = new FormData(this.packageData)
        // console.log(myformdata)
        // wx upload file can upload only one file a time, so need to upload multiple times
        let header = { 'Content-Type': 'application/x-www-form-urlencoded' }
        let resp = await post('parcels/edit_parcel/', this.formData, header)
        // let resp = await post('companyparcels/edit_parcel/', this.packageData)
        console.log('upload resp:' + resp)
        wx.hideLoading()
        showSuccess('上传成功')
        event.emit('totalChanged', {
          id: this.packageData.id,
          total: this.total_price
        })

        // this.resetData()
      } catch (error) {
        errid = -1
        console.log('Upload failed! error:' + error)
        wx.hideLoading()
        if (error.message === 'Info') {
          showFail('请完善货物内容')
        } else if(error.message === 'Title'){
          showFail('请勿填写日用品/生活用品/食品/茶叶等概括性名称或者品牌如“三只松鼠”以免误导耽误清关报关')
        } else if(error.message === 'Materials'){
          showFail('混合材质请写明具体成分，例如塑料，金属')
        } else {
          showFail('上传错误')
        }
        throw error
      }
      return errid

      // this.resetData()
    },
    async submitBack () {
      try {
        let errid = await this.submit()
        console.log(errid)
        if (this.canBack) {
          wx.navigateBack({ delta: -1 })
        } else {
          wx.reLaunch({
            url: '/pages/home'
          })
        }
      } catch (error) {

      }
    },
    btnBack () {
      wx.reLaunch({
        url: '/pages/home'
      })
    }
  },
  onUnload () {
    this.resetData()
  }
}
</script>
<style scoped lang="scss">
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
    }
    .desc {
      font-size: 0.9em;
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
  .item-notice {
      font-size: 22rpx !important;
      color:$theme-color;
    }
  .detail-container{
    margin: 1em;
    overflow-x:hidden;
    white-space:nowrap;
  }

  .total-row {
    padding-top: 0 !important;
    margin-top: 10upx !important;
    justify-content: space-between;
    p {
      font-weight: bold;
      font-size: 1em;
    }
    .icon {
      font-size: 1.6em;
    }
  }
  .submit{
    margin-top: 30upx;
    background-color: $theme-color;
    color: white;
    width: 80%;
    box-shadow: 0px 4px 16px #455B6308;
    border-radius: 3px;
  }
  .submitBack {
    margin-bottom: 50upx;
  }
  textarea {
    background: white;
    width: 70%;
    font-size: 1em;
    line-height: 1em;
    height: 3em;
  }
  .input-title{
    background: #ececec;
  }
  .inquire {
    background-color: $uni-color-error;
  }

</style>
