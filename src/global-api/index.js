// Vue.directive Vue.filter Vue.component
import { mergeOptions } from '../utils'

export function initGlobalAPI(Vue) { //全局api
  Vue.options = {}

  //公共方法 合并options
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)
  }
}