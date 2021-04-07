process.env.VUE_APP_USE_HOST_API_LOCAL = process.env.USE_LOCAL_HOST_API
console.log('Use local dev server ' + process.env.VUE_APP_USE_HOST_API_LOCAL)
process.env.UNI_OUTPUT_DIR = './dist/' + process.env.UNI_PLATFORM
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const isProd = process.env.NODE_ENV === 'production'
if (process.env.UNI_PLATFORM === 'mp-weixin') {
  const {
    getManifestJson
  } = require('@dcloudio/uni-cli-shared')
  // console.log(getManifestJson()['mp-weixin'].appid)
  process.env.VUE_APP_MP_WEIXIN_APPID = getManifestJson()['mp-weixin'].appid
}
module.exports = {
  lintOnSave: 'error',
  devServer: {
    overlay: {
      warnings: true,
      errors: true
    }
  },
  configureWebpack: {
    optimization: {
      minimizer: isProd ? [
        new UglifyJsPlugin({
          uglifyOptions: {
            compress: {
              drop_console: true
            }
          }
        })
      ] : []
    }
  }
}
