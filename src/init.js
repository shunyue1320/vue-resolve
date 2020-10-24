import { initState } from './state'
import { compileToFunctions } from './compiler/index.js'
import {mountComponent, callHook} from './lifecycle.js'
import { mergeOptions } from './utils'
import { callHook } from './lifecycle.js'


export function initMixin (Vue) {
  Vue.prototype._init = function(options) {
    const vm = this

    //合并options
    vm.$options = mergeOptions(vm.constructor.options || {}, options)
    
    callHook(vm, 'beforeCreate')
    initState(vm) //初始化状态
    callHook(vm, 'created')

    //在根节点渲染页面
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this
    el = vm.$el = document.querySelector(el)

    //遵循源码 render > template > el 渲染机制
    const opts = vm.$options;

    if (!opts.render) {
      let template = opts.template
      if (!template && el) {
        template = el.outerHTML
        console.log(template);
      }

      const render = compileToFunctions(template)
      opts.render = render
      console.log("render", render);
    }
    // 走到这用户传入是render函数不需编译 --initMixin初始化结束
    mountComponent(vm); // 组件的挂载流程
  }
}