import { createTextVNode, createElement } from './vdom/create-element'


export function renderMixin(Vue) {
  Vue.prototype._v = function (text) {  //创建文本节点
    return createTextVNode(text)
  }
  Vue.prototype._c = function () {      //创建标签节点
    return createElement(...arguments)
  }
  Vue.prototype._s = function (val) {   // 判断当前这个值是不是对象 ，如果是对象 直接转换成字符串 ，防止页面出现[object Object]
    return val == null ? '' : (typeof val === 'object') ? JSON.stringify(val) : val
  }
  Vue.prototype._render = function () { //字符串实现的render方法
    const vm = this
    const { render } = vm.$options
    let vnode = render.call(vm)         //方法存在Vue原型上 this指向Vue _v _c  _s
    return vnode
  }
}