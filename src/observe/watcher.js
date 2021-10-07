import Dep from './dep'
import { queueWatcher } from './schedular'
let wid = 0
class Watcher {
  constructor(vm, fn, cb, options) {
    this.vm = vm
    this.fn = fn
    this.cb = cb
    this.options = options
    this.deps = []
    this.depsId = new Set()
    this.id = wid++
    this.get() // 实现页面的渲染
  }

  get() {
    Dep.target = this
    this.fn() // 去实例中取值  触发getter
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