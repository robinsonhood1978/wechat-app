<template>
  <view style="position: relative">
    <Login v-if="!isLogedIn"> </Login>
    <view v-else>
      <!--    <scroll-view class="grace-tab-title" scroll-x="true" id="grace-tab-title" :scroll-into-view="titleShowId">-->
      <!--      <view v-for="(tab, index) in tabs" :key="index" :class="[tabCurrentIndex == index ? 'grace-tab-current' : '']" :id="'tabTag-'+index" @tap="tabChange">{{tab.name}}</view>-->
      <!--    </scroll-view>-->
      <!--    <swiper class="grace-tab-swiper-full" :current="swiperCurrentIndex" @change="swiperChange" :style="{height:tabHeight+'px'}">-->
      <!--      &lt;!&ndash; 循环新闻项目 &ndash;&gt;-->
      <!--      <swiper-item v-for="(tab, tabIndex) in tabs" :key="tabIndex">-->
      <!--        <div style="position: relative">-->
      <div style="">
        <view class="noPackage" v-if="!userProfile.is_customer">
          <h2>请完善信息获取转运地址</h2>
          <navigator url="/pages/weblogin?tab=0">
            <button class="button">完善信息获取集运地址</button>
          </navigator>
          <div style="margin-top: 50px; padding-bottom: 200upx">
          </div>
        </view>
        <view style="height: 100vh" v-else>

          <scroll-view scroll-y="true" :data-scindex="tabIndex" @scrolltolower="scrollend">
            <view style="padding-top: 5px;" />
            <view v-if="list.length == 0" >
              <div class="noPackage">没有运单</div>
              <addressCn></addressCn>
              <div style="margin-top: 30px">
                <InfoGrids></InfoGrids>
              </div>
              <view style="padding-bottom: 300upx"></view>
            </view>
            <view v-else>
              <OrderCardDetails
                :key="packageItem.id"
                :orderData="packageItem"
                v-for="(packageItem) in list"
              ></OrderCardDetails>
              <graceLoading :loadingType="tab.loadingType"></graceLoading>
              <view style="padding-bottom: 200upx;" />
            </view>
          </scroll-view>
        </view>
      </div>
      <!--      </swiper-item>-->
      <!--    </swiper>-->
    </view>
    <div class="grace-footer fixed-bottom" v-if="userProfile.is_customer">
      <navigator url="/pages/freightorders/addOrder">
        <button class="button">新建运单</button>
      </navigator>
    </div>
  </view>
</template>

<script>
import { get, setCID, setUID, setSCENE } from '@/utils/index'
import { mapState } from 'vuex'
import Login from '@/components/login'
import addressCn from '@/components/addressCn'
import OrderCardDetails from '@/components/order-card-detail'
// import mpNavbar from 'mpvue-weui/src/navbar'
import event from '@/utils/event'
import graceLoading from '@/graceUI/components/graceLoading.vue'

var _self
export default {
  data () {
    return {
      orderNeedPay: 0,
      packagesList: [],
      tempList: [],
      myparcels: [],
      companyParcels: [],
      hideHasInfo: false,
      navTab: ['待完善', '待出库', '处理中', '已出库'],
      tabCurrentIndex: 0,
      swiperCurrentIndex: 0,
      tabHeight: 300,
      tabs: [
        // 标签名称 , 分类 id , 加载更多, 加载的页码
        { name: '待完善', status: 'D', loadingType: 0, list: [], loadAll: false, needUpdate: true },
        { name: '待出库', status: 'P', loadingType: 0, list: [], loadAll: true, needUpdate: false },
        { name: '处理中', status: 'T', loadingType: 0, list: [], loadAll: true, needUpdate: false },
        { name: '已出库', status: 'H', loadingType: 0, list: [], loadAll: false, needUpdate: false }
      ],
      titleShowId: 'tabTag-0',
      needUpdate: true,

      activeIndex: 0,
      apiBase: 'freightorders/',
      menuOpen: false,
      currentApiBase: '',
      loadingType: 0,
      list: [],
      loadAll: false
    }
  },
  components: {
    OrderCardDetails,
    Login,
    // mpNavbar,
    addressCn,
    graceLoading
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
    event.on('newOrder', this, async function (obj) {
      console.log('new order')
      this.tabs.forEach(p => {
        p.needUpdate = true
      })
      
    })
    console.log(this.isLogedIn)
    if (this.isLogedIn) {
      this.loadList()
    }
  },
  onReady: function () {
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
  async onShow () {
    let url = 'parcels/?state=P&unsent=1&count=0'
    let parcels = await get(url)
    console.log('Order onShow:'+parcels.length)
    if(parcels.length>0){
        wx.setTabBarBadge({
          index: 0, 
          text: ''+parcels.length+'',
        })
        console.log('Order onShow222:'+parcels.length)
      }
      else{
        wx.removeTabBarBadge({
          index: 0
        })
      }

      await this.loadUnpaidOrder();
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
    userProfile () {
      console.log('userProfile ready')
      if (this.userProfile.is_customer) {
        this.loadList()
        // this.updateInfo()
      }
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
      this.list.forEach(p => {
        // let volume = (parseInt(p.volume * 100) / 100 !== p.volume) ? parseInt(p.volume * 100) / 100 + 0.01 : (p.volume * 100 / 100)
        sum = sum + p.volume
      })
      sum += 0.00099
      return sum.toFixed(3)
    },
    totalWeight () {
      let sum = 0
      this.list.forEach(p => {
        sum = sum + p.weight
      })
      return sum.toFixed(2)
    },
    totalVolumeWeight () {
      return (parseInt((this.totalVolume / 0.006) * 10) / 10 + 0.01).toFixed(1)
    },
    totalValue () {
      let sum = 0
      this.list.forEach(p => {
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
      // var index = e.currentTarget.dataset.scindex
      // console.log(index)
      // // 可以利用 tabs 携带的分类id 与服务器交互请求对应分类的数据
      // console.log(this.tabs[index].id)
      if (this.loadAll) {
        this.loadingType = 2
        return
      }
      // 加载更多的演示
      // 判断当前是否正在加载
      if (this.loadingType === 1) {
        return false
      }
      this.loadingType = 1
      var list
      if (this.list.length === 0) {
        let apiUrl = this.apiBase +
            (this.loadAll ? 'count=-1' : ('start=' + this.list.length))
        list = await get(apiUrl)
      }

      // 判断是否是最后一页
      if (list.length === 0) {
        this.loadingType = 2// 全部
        return
      }
      this.list.concat(list)
      this.loadingType = 0
    },
    tabChange: function (e) {
      var index = e.target.id.replace('tabTag-', '')
      this.swiperCurrentIndex = index
      this.tabCurrentIndex = index
      this.titleShowId = 'tabTag-' + index
      // this.loadList()
    },
    swiperChange: function (e) {
      var index = e.detail.current
      this.tabCurrentIndex = index
      this.titleShowId = 'tabTag-' + index
      // this.loadList()
    },
    async loadList (force = false) {
      if (!this.userProfile.is_customer) {
        return
      }
      wx.showLoading({ title: '加载中...' })
      if (this.needUpdate || force) {
        let apiUrl = this.apiBase + '?count=10'
        let tmpList = await get(apiUrl)
        // this.list = this.tabFilter(tmpList, this.tabCurrentIndex)
        this.list = tmpList
        if (this.list.length === 0 || this.loadAll) {
          this.loadingType = 2
        }
        this.needUpdate = false
      }
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
        // case 0:
        //   return list.filter(p => p.total === 0)
        // case 1:
        //   return list.filter(
        //     p => p.total !== 0 && p.dform === null
        //   )
        // case 2:
        //   return list.filter(p => p.dform !== null)
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
</style>
