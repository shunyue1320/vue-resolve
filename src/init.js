import { initState } from './state';
import { mergeOptions } from './utils';
import { callHook } from './lifecycle.js'


export function initMixin (Vue) {
  Vue.prototype._init = function(options) {
    const vm = this

    //合并options
    vm.$options = mergeOptions(vm.constructor.options, options)
    
    callHook(vm, 'beforeCreate')
    initState(vm) //初始化状态
    callHook(vm, 'created')


  }
}