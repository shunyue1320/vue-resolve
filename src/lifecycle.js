import { createElement, createTextNode } from "./vdom/index"
import { patch } from "./vdom/patch"
import Watcher from "./observe/watcher"

// 创造对应的虚拟节点 进行渲染
export function lifeCycleMixin(Vue) {
  Vue.prototype._c = function() { // 生成 vnode
    return createElement(this, ...arguments)
  }
  Vue.prototype._v = function() {
    return createTextNode(this, ...arguments)
  }
  Vue.prototype._s = function(value) { // 将数据转化成字符串 因为使用的变量对应的结果可能是一个对象
    if(typeof value === 'object' && value !== null){
      return JSON.stringify(value)
    }
    return value
  }
  Vue.prototype._render = function() {
    const vm = this;
    const render = vm.$options.render;
    let vnode = render.call(vm); // _c( _s _v)  with(this) 【此处获取属性时被 Watcher 监听】
    console.log("vnode =", vnode)
    return vnode;
  }
  Vue.prototype._update = function(vnode) { // 将虚拟节点变成真实节点
    // 将 vnode 渲染el元素中
    const vm = this;
    vm.$el = patch(vm.$el,vnode); // 可以初始化渲染， 后续更新也走这个patch方法
  }
}


export function mountComponent(vm, el) {
  // 实现页面的挂载流程
  vm.$el = el;// 先将 el 挂载到实例上
  const updateComponent = () => {
    // 需要调用生成的render函数 获取到虚拟节点  -> 生成真实的dom
    vm._update(vm._render());
  }

  // 添加监听
  new Watcher(vm, updateComponent, ()=>{
    console.log('页面重新渲染 updated')
  }, true)
  // updateComponent(); // 如果稍后数据变化 也调用这个函数重新执行 
  //后续：观察者模式 + 依赖收集 + diff算法
}