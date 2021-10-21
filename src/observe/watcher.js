import Dep, { pushTarget, popTarget } from './dep'
import { queueWatcher } from './schedular'
let wid = 0
class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    this.cb = cb
    this.options = options
    this.deps = []
    this.depsId = new Set()
    this.id = wid++
    this.lazy = !!options.lazy   // lazy属性是用来标识默认是否调用函数 (computed)
    this.dirty = this.lazy       // dirty属性是用来做缓存的

    this.user = !!options.user   // 如果是用户watcher会多一个属性 user:true
    
    // 如果给的是一个字符串， 需要去通过字符串取值
    if (typeof exprOrFn == 'function') {
      this.getter = exprOrFn // updateComponent
    } else {
      this.getter = function () { // user watch 获取监听变量的值
        let path = exprOrFn.split('.')
        return path.reduce((vm, current) => {
          vm = vm[current] // 触发getter  执行 dep.depend()  给  dep.watchers 添加一个 watcher 
          return vm
        }, vm)
      }
    }

    this.value = this.lazy ? undefined : this.get() // 实现页面的渲染
  }

  get() {
    // 为什么要加 pushTarget 与 popTarget 其实就是因为 computed 执行 get 方法时里面来触发了其他响应式变量的get
    // 
    pushTarget(this) // 收集各种 watcher （updateComponent, watch, computed）
    const value =  this.getter.call(this.vm); // 去实例中取值  触发getter
    popTarget()

    return value
  }
  addDep(dep) {
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addWatcher(this)
    }
  }
  update() {
    if(this.lazy){ // 是计算属性watcher不需要走渲染
      this.dirty = true
    } else {       // 渲染用户 watcher
      queueWatcher(this)
    }
  }
  run() {
    // 稍后会触发run方法, 找到对应的回调让回调执行传入新值和老值
    let newValue = this.get() // 获取最新的状态
    let oldValue = this.value // 上次保留的老值
    this.value = newValue     // 用新值作为老的值
    
    if (this.user) { // 用户 watch 回调， 参数：(新值， 老值)
      this.cb.call(this.vm, newValue, oldValue)
    }
  }

  evaluate() {
    this.value = this.get()
    this.dirty = false
  }
  depend() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  teardown() {
    // 1. 删除这个 watchers
    const _watchers = this.vm._watchers
    if (_watchers.length) {
      const index = _watchers.indexOf(this)
      if (index > -1) {
        return _watchers.splice(index, 1)
      }
    }

    // 2. 删除所有 dep 内的这个 watchers
    let i = this.deps.length
    while (i--) {
      this.deps[i].removeWatcher(this)
    }
  }
}

// watcher 与 dep 多对多关系，一个属性对应多个 watcher, 一个 watcher 对应多个 dep

export default Watcher