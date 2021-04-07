<template>
  <view>
    <Login v-if="!isLogedIn"> </Login>
    <view v-else>
<!--      <scroll-view class="grace-tab-title" scroll-x="true" id="grace-tab-title" :scroll-into-view="titleShowId">-->
<!--        <view v-for="(tab, index) in tabs" :key="index" :class="[tabCurrentIndex == index ? 'grace-tab-current' : '']" :id="'tabTag-'+index" @tap="tabChange">{{tab.name}}</view>-->
<!--      </scroll-view>-->
<!--    <graceNavBar :items="navTab" :currentIndex="tabCurrentIndex" @change="tabChange"></graceNavBar>-->
      <graceNavBar :items="navTab"
                   lineHeight="80rpx" :isCenter="true" class="grace-fixed-top"
                   :currentIndex="tabCurrentIndex" :size="120" padding="20rpx"
                   activeLineBg="#BE1416" textAlign="center"
                   activeColor="#BE1416" activeLineWidth="100%" activeLineHeight="3px"
                   :margin="10" @change="tabChange"></graceNavBar>
      <swiper class="grace-tab-swiper-full has-fix-top" :current="swiperCurrentIndex" @change="swiperChange" :style="{height:tabHeight+'px'}">
          <!-- 循环新闻项目 -->
        <swiper-item v-for="(tab, tabIndex) in tabs" :key="tabIndex">
          <div style="position: relative">
            <view class="noPackage" v-if="!userProfile.is_customer">
              <h2>请完善信息获取转运地址</h2>
              <navigator url="/pages/weblogin?tab=0">
                <button class="button">完善信息获取集运地址</button>
              </navigator>
              <div style="margin-top: 50px; padding-bottom: 200upx">
                <InfoGrids></InfoGrids>
              </div>
            </view>
            <!-- <view style="height: 100vh" v-else> -->

              <scroll-view scroll-y="true" :data-scindex="tabIndex" @scrolltolower="scrollend" v-else style="height: 100vh">
                <view style="padding-top: 5px;" />
                <view v-if="tab.list.length == 0" >
                  <div class="noPackage">没有包裹!</div>
                  <addressCn></addressCn>
                  <div style="margin-top: 30px">
                    <InfoGrids></InfoGrids>
                  </div>
                  <view style="padding-bottom: 300upx"></view>
                </view>
                <view v-else>
                  <PackageCardDetails
                    :key="packageItem.id"
                    :packageData="packageItem"
                    v-for="(packageItem) in tab.list"
                  ></PackageCardDetails>
                  <graceLoading :loadingType="tab.loadingType"></graceLoading>
                </view>
              </scroll-view>
            <!-- </view> -->
          </div>
        </swiper-item>
      </swiper>
      <div class="grace-footer fixed-bottom" v-if="userProfile.is_customer && tabCurrentIndex == 1">
        <navigator url="/pages/freightorders/addOrder">
          <button class="button">新建运单,申请出库</button>
        </navigator>
      </div>
    </view>
  </view>
</template>

<script>
import { get, setCID, setUID, setSCENE } from '@/utils/index'
import { mapState } from 'vuex'
import Login from '@/components/login'
import addressCn from '@/components/addressCn'
import PackageCardDetails from '@/components/package-card-detail'
import graceNavBar from '@/graceUI/components/graceNavBar.vue'
// import mpNavbar from 'mpvue-weui/src/navbar'
import InfoGrids from '@/components/info-grids'
import event from '@/utils/event'
import graceLoading from '@/graceUI/components/graceLoading.vue'

var _self
export default {
  data () {
    return {
      parcelNeedDeal: 0,
      orderNeedPay: 0,
      packagesList: [],
      tempList: [],
      myparcels: [],
      companyParcels: [],
      hideHasInfo: false,
      navTab: ['待完善', '待出库', '处理中', '已出库'],
      tabCurrentIndex: 0,
      swiperCurrentIndex: 0,
      tabHeight: 598,
      tabs: [
        // 标签名称 , 分类 id , 加载更多, 加载的页码
        { title: '待完善', status: 'P&filed=0&unsent=1', loadingType: 0, list: [], loadAll: false, needUpdate: true },
        { title: '待出库', status: 'P&filed=1&unsent=1', loadingType: 0, list: [], loadAll: false, needUpdate: true },
        { title: '处理中', status: 'P&unsent=0', loadingType: 0, list: [], loadAll: false, needUpdate: true },
        { title: '运输中', status: 'T', loadingType: 0, list: [], loadAll: false, needUpdate: true }
      ],
      titleShowId: 'tabTag-0',
      needUpdate: false,

      activeIndex: 0,
      apiBase: 'parcels/',
      menuOpen: false,
      currentApiBase: ''
    }
  },
  components: {
    PackageCardDetails,
    Login,
    // mpNavbar,
    addressCn,
    InfoGrids,
    graceLoading,
    graceNavBar
  },
  onReady(){
    
  },
  onLoad () {
      


    _self = this
    // const scene = decodeURIComponent(this.$root.$mp.query.scene)
    setCID(this.appOptions.query.cid)
    setUID(this.appOptions.query.uid)
    setSCENE(decodeURIComponent(this.appOptions.query.scene))
    console.log(
      'CID: ' +
        this.CID +
        ' UID:' +
        this.uid +
        ' Scene: ' +
        (this.scene !== 'undefined' ? '?' + this.scene : '')
    )
    event.on('totalChanged', this, function (obj) {
      console.log(obj.id + ' total:' + obj.total)
      this.tabs.forEach(p => { p.needUpdate = true })
      this.loadList()
    })
    event.on('newOrder', this, function (obj) {
      console.log('new order')
      this.tabs.forEach(p => {
        p.needUpdate = true
        this.loadList()
      })
    })
    console.log(this.isLogedIn)
    if (this.isLogedIn) {
      this.loadList()
    }
  },

  async onShow () {
    this.loadUnpaidOrder();
    console.log('onShow:'+this.parcelNeedDeal)
      if(this.parcelNeedDeal>0){
        wx.setTabBarBadge({
          index: 0, 
          text: ''+this.parcelNeedDeal+'',
        })
        console.log('onShow222:'+this.parcelNeedDeal)
      }
      else{
        wx.removeTabBarBadge({
          index: 0
        })
      }

      if(this.orderNeedPay>0){
        wx.setTabBarBadge({
          index: 1, 
          text: ''+this.orderNeedPay+'',
        })
      }
      else{
        wx.removeTabBarBadge({
          index: 1
        })
      }

    if (this.isLogedIn) {
      uni.showTabBar()
      // this.loadList()
    } else {
      uni.hideTabBar()
    }
    // 获取屏幕高度及比例
    uni.getSystemInfo({
      success: function (res) {
        var windowHeight = res.windowHeight
        // 获取头部标题高度
        var dom = uni.createSelectorQuery().select('#grace-tab-title')
        dom.fields({ size: true }, res2 => {
          if (!res2) { return }
          // 计算得出滚动区域的高度
          _self.tabHeight = windowHeight - res2.height
        }).exec()
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: 'YUN运过来聚合跨境物流',
      path: 'pages/home?uid=' + this.userProfile.uid,
      imageUrl: '/static/images/YUN_SQ.jpg'
      // imageUrl:
      //   apiHost +
      //   (this.companyInfo.client_app
      //     ? this.companyInfo.client_app.forward_logo
      //       ? this.companyInfo.client_app.forward_logo
      //       : this.companyInfo.client_app.home_logo
      //         ? this.companyInfo.client_app.home_logo
      //         : this.companyInfo.logo
      //     : this.companyInfo.logo)
    }
  },
  watch: {
    userProfile: function () {
      console.log('userProfile ready')
      if (this.userProfile.is_customer) {
        this.loadList()
        // this.updateInfo()
      }
    },
    parcelNeedDeal: function(){
      console.log("parcelNeedDeal changed:"+this.parcelNeedDeal)
      if(this.parcelNeedDeal>0){
        wx.setTabBarBadge({
          index: 0, 
          text: ''+this.parcelNeedDeal+'',
        })
      }
      else{
        wx.removeTabBarBadge({
          index: 0
        })
      }
    },
    orderNeedPay: function(){
      if(this.orderNeedPay>0){
        wx.setTabBarBadge({
          index: 1, 
          text: ''+this.orderNeedPay+'',
        })
      }
      else{
        wx.removeTabBarBadge({
          index: 1
        })
      }
    },
    tabs: {
        async handler(newVal,oldVal){
            if(this.tabs[1].needUpdate){
              await this.loadList(false,1)
            }
            console.log('this.tabs[0].list.length:'+this.tabs[0].list.length)
            if(this.tabs[0].list.length===0 && !this.tabs[0].needUpdate){
                console.log('this.tabs[1].list.length:'+this.tabs[1].list.length)
                if(this.tabs[1].list.length===0){
                  wx.switchTab({ url:'order' })
                }
                else{
                  this.swiperCurrentIndex = 1
                  this.tabCurrentIndex = 1
                  this.titleShowId = 'tabTag-' + 1
                }
            }
            this.parcelNeedDeal = this.tabs[0].list.length + this.tabs[1].list.length; 
        },
        deep:true
    },
    isLogedIn () {
      if (this.isLogedIn) {
        uni.showTabBar()
      } else {
        uni.hideTabBar()
      }
    }
  },
  computed: {
    ...mapState([
      'isLogedIn',
      'userProfile',
      'CID',
      'uid',
      'scene',
      'companyInfo',
      'appOptions'
    ]),
    totalVolume () {
      let sum = 0
      this.tabs[this.tabCurrentIndex].list.forEach(p => {
        // let volume = (parseInt(p.volume * 100) / 100 !== p.volume) ? parseInt(p.volume * 100) / 100 + 0.01 : (p.volume * 100 / 100)
        sum = sum + p.volume
      })
      sum += 0.00099
      return sum.toFixed(3)
    },
    totalWeight () {
      let sum = 0
      this.tabs[this.tabCurrentIndex].list.forEach(p => {
        sum = sum + p.weight
      })
      return sum.toFixed(2)
    },
    totalVolumeWeight () {
      return (parseInt((this.totalVolume / 0.006) * 10) / 10 + 0.01).toFixed(1)
    },
    totalValue () {
      let sum = 0
      this.tabs[this.tabCurrentIndex].list.forEach(p => {
        sum = sum + p.total
      })
      return sum.toFixed(2)
    }
  },
  async onPullDownRefresh () {
    if (this.isLogedIn) {
      await this.loadList(true)
    }
    uni.stopPullDownRefresh()
  },
  methods: {
    async scrollend (e) {
      // 获取是哪个选项滚动到底？
      var index = e.currentTarget.dataset.scindex
      console.log(index)
      // 可以利用 tabs 携带的分类id 与服务器交互请求对应分类的数据
      console.log(this.tabs[index].name)
      if (this.tabs[index].loadAll) {
        this.tabs[index].loadingType = 2
        return
      }
      // 加载更多的演示
      // 判断当前是否正在加载
      if (this.tabs[index].loadingType === 1 || this.tabs[index].loadingType === 2) {
        return false
      }
      this.tabs[index].loadingType = 1
      // if (this.tabs[index].list.length === 0) {
      let apiUrl = 'parcels/?state=' + this.tabs[index].status +
        (this.tabs[this.tabCurrentIndex].loadAll ? '&count=-1' : ('&start=' + this.tabs[index].list.length))
      let list = await get(apiUrl)
      // } else {
      //   let apiUrl = 'parcels/?state=' + this.tabs[index].status +
      //     (this.tabs[this.tabCurrentIndex].loadAll ? '&count=10' : ('&start=' + this.tabs[index].list.length))
      //   list = await get(apiUrl)
      // }

      // 判断是否是最后一页
      if (list.length === 0) {
        this.tabs[index].loadingType = 2// 全部
        return
      }
      this.tabs[index].list = this.tabs[index].list.concat(list)
      console.log(this.tabs[index].list)
      this.tabs[index].loadingType = 0
    },
    tabChange: function (index) {
      console.log('tabChange')
      this.swiperCurrentIndex = index
      this.tabCurrentIndex = index
      this.titleShowId = 'tabTag-' + index
      // this.loadList()
    },
    swiperChange: function (e) {
      console.log('swiperChange')
      var index = e.detail.current
      this.tabCurrentIndex = index
      this.titleShowId = 'tabTag-' + index
      this.loadList()
    },
    async loadList (force = false, tab = this.tabCurrentIndex) {
      if (!this.userProfile.is_customer) {
        return
      }
      //jumpFlag(tab,this.tabs[tab].list)
      wx.showLoading({ title: '加载中...', mask: true })
      // if (this.tabs[this.tabCurrentIndex].list.length === 0 || this.tabs[this.tabCurrentIndex].needUpdate || force) {
      if (this.tabs[tab].needUpdate || force) {
        let apiUrl = 'parcels/?state=' + this.tabs[tab].status +
          (this.tabs[tab].loadAll ? '&count=-1' : '&count=10')
        let tmpList = await get(apiUrl)
        this.tabs[tab].loadingType = 0
        // this.tabs[this.tabCurrentIndex].list = this.tabFilter(tmpList, this.tabCurrentIndex)
        this.tabs[tab].list = tmpList
        if (this.tabs[tab].list.length === 0 || this.tabs[tab].loadAll) {
          this.tabs[tab].loadingType = 2
        }
        this.tabs[tab].needUpdate = false
      }
      this.loadUnpaidOrder();
      
      
      wx.hideLoading()
      
    },
    async loadUnpaidOrder(){
      let url = 'freightorders/?count=0'
      let orders = await get(url)
      this.orderNeedPay = 0
      orders.forEach(p => {
        if(!p.paid){
          this.orderNeedPay++
        }
      })
    },
    tabFilter (list, tabIndex) {
      switch (tabIndex) {
        case 0:
          return list.filter(p => p.total === 0 && p.dform === null)
        case 1:
          return list.filter(
            p => p.total !== 0 && p.dform === null
          )
        case 2:
          return list.filter(p => p.dform !== null)
        default:
          return list
      }
    },
    updateInfo () {
      let url = '/pages/weblogin?tab=0'
      uni.navigateTo({ url })
    }
  }
}
</script>
<style scoped lang="scss">
  .adminbar {
    margin: 5px 5px 0px;
    text-align: end;
    font-size: 0.7em;
    font-weight: bold;
  }
  .fixed-bottom {
    bottom: 70upx;
    width: 100%;
    background: #00000000;
    box-shadow: unset;
    height: 100px;
  }
  .noPackage {
    text-align: center;
    margin: 50upx;
  }
  .button {
    margin: auto;
    background-color: $theme-color;
    width: 80%;
    box-shadow: 0px 4px 16px #455B6308;
    border-radius: 3px;
    text-align: center;
    color: white;
    margin-top: 50upx;
  }
  .has-fix-top {
    margin-top: 100upx;
  }
</style>
