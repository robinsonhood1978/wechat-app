<template>
  <view>
    <Login v-if="!isLogedIn"> </Login>
    <view v-else class="grace-body" style="height:100vh">

      <h1>卡券兑换</h1>
      <form @submit="formSubmit" class="grace-form grace-margin-top">
        <view class="grace-form-item grace-border-b">
          <text class="grace-icons icon-wallet  grace-form-icon grace-red"></text>
          <text class="grace-form-label">卡券密码</text>
          <view class="grace-form-body">
            <input type="text" class="grace-form-input"  v-model="voucherCode" placeholder="请输入内容" />
          </view>
        </view>
        <view style="padding:22rpx 0;">
          <button class="grace-button grace-bg-red" style="line-height:80rpx;" @click="submit">兑换卡劵</button>
        </view>
      </form>
      <h1 style="margin-bottom: 50upx" v-if="vouchers.length>=1">我的优惠券</h1>
        <VoucherCardDetails
          :key="voucher.id"
          :voucher="voucher"
          v-for="(voucher) in vouchers"
        ></VoucherCardDetails>

  </view>
  </view>
</template>

<script>
import { get, post, showFail, showSuccess } from '@/utils/index'
import event from '@/utils/event'
import { mapState } from 'vuex'
import VoucherCardDetails from '@/components/voucher-card'
import Login from '@/components/login'
function data () {
  return {
    showBusiness: false,
    voucherCode: '',
    vouchers: []
  }
}
export default {
  computed: {
    ...mapState([
      'companyInfo',
      'address',
      'isLogedIn'
    ])
  },
  components: {
    VoucherCardDetails,
    Login
  },
  mounted () {
    Object.assign(this, data())
    this.voucherCode = this.$root.$mp.query.code
    console.log('Voucher Code: ' + this.voucherCode)
    this.fetchVouchers()
  },
  data,
  methods: {
    async submit () {
      wx.showLoading({ title: '核销中...', mask: true })
      console.log(this.voucherCode)
      if (this.voucherCode=== '' || this.voucherCode === undefined) {
        wx.hideLoading()
        showFail('请填写卡券兑换码')
        return
      }
      let data = {
        code:this.voucherCode
      }
      let header = { 'Content-Type': 'application/json' }
      let resp = await post('promotions/vouchers/', data, header)
      console.log(resp)
      wx.hideLoading()
      if (resp.code === 0) {
        // event.emit('addressChanged', {})
        // wx.navigateBack({ changed: true })
        showSuccess(resp.message)
        this.fetchVouchers()

      } else(
          showFail(resp.message)
      )
    },
    closeModal () {
      this.show = false
      this.$emit('show', this.show)
      console.log(this.show)
    },
    switchChange (e) {
      let value = e.target.value
      this.$set(this, 'showBusiness', value) // 将点击改变的状态赋给treatmentStatu.checked
    },
    async fetchVouchers () {
      let apiUrl = 'promotions/vouchers/'
      let list = await get(apiUrl)
      console.log(list)
      this.vouchers = list.object
    }
  }
}
</script>

<style scoped lang="scss">

.voucher-scroll {
  height: auto;
}
h1 {
  font-size: 1.3em;
  margin-top: 30upx;
}
</style>
