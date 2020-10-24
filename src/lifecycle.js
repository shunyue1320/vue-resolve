import Watcher from './observer/watcher';
import { patch } from './vdom/patch';

export function lifeCycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this
    // 将虚拟节点 变成 真实节点 替换掉$el 后续 dom diff 也会执行此方法
    vm.$el = patch(vm.$el, vnode)
  }
}

//钩子函数是用数组存储的所以需要for
export function callHook(vm, hook) {
  let handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm)  //生命周期 this 指向vm实例
    }
  }
}

//当挂载组件时需要用到次方法
export function mountComponent(vm, el) {
  // Vue在渲染的过程中 会创建一个 所谓的“渲染watcher ” 只用来渲染的
  // watcher就是一个回调 每次数据变化 就会重新执行watcher


  // Vue是不是MVVM框架
  callHook(vm, 'beforeMount')
  const updateComponent = () => {
    // 内部会调用刚才我们解析后的render方法 =》 vnode
    // _render => options.render 方法
    // _update => 将虚拟dom 变成真实dom 来执行
    console.log('update')
    vm._update(vm._render());
  }

  // 每次数据变化 就执行 updateComponent 方法 进行更新操作
  new Watcher(vm, updateComponent, () => { }, true);

  callHook(vm, 'mounted');
  // vue 响应式数据的规则 数据变了 视图会刷新
}