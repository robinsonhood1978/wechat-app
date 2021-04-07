import Vue from 'vue'
import App from './App'
import store from './store'
import moment from 'moment'

Vue.filter('dateStr', function (value, format = 'DD/MM/YYYY') {
  // eslint-disable-next-line no-undef
  return moment(value).format(format)
})
Vue.config.productionTip = false
App.mpType = 'app'

Vue.prototype.$store = store

const app = new Vue(App)
app.$mount()

var fundebug = require('fundebug-wxjs')
fundebug.init(
  {
    apikey: '597c2fbc33649214aebe70dc8f301e106465d16f782dc1898e0ae835eb7b94e1',
    monitorHttpData: true,
    setUserInfo: true,
    setSystemInfo: true,
    monitorMethodCall: true,
    monitorMethodArguments: true,
    releaseStage: 'production'
  }
)

export default {
  // 这个字段走 app.json
  config: {
  }
}
