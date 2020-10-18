
import { mergeOptions } from './utils';


export function initMixin (Vue) {
  Vue.prototype._init = function(options) {
    const vm = this
    vm.$options = mergeOptions(vm.constructor.options, options) //合并options
  }
}