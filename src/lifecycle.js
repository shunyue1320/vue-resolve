import Watcher from './observer/watcher';
import { patch } from './vdom/patch';

//钩子函数是用数组存储的所以需要for
export function callHook(vm, hook) {
  let handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm)  //生命周期 this 指向vm实例
    }
  }
}