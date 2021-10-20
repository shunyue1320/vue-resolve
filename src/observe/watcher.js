import Dep { pushTarget } from './dep'
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
          vm = vm[current]
          return vm
        }, vm)
      }
    }

    this.value = this.lazy ? undefined : this.get() // 实现页面的渲染
  }

  get() {
    pushTarget(this) // 收集各种 watcher （updateComponent, watch, compone）
    const value =  this.getter.call(this.vm); // 去实例中取值  触发getter
    popTarget()

    Dep.target = this
    this.exprOrFn() // 去实例中取值  触发getter
    Dep.target = null // 只有在渲染的时候才有Dep.target属性
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
    queueWatcher(this)
  }
  run() {
    this.get() // 重新执行 updateComponent
  }
}

// watcher 与 dep 多对多关系，一个属性对应多个 watcher, 一个 watcher 对应多个 dep

export default Watcher