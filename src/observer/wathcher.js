import { pushTarget, popTarget } from "./dep";
import { queueWatcher } from "./scheduler";

let id = 0; // 做一个watcher 的id 每次创建watcher时 都有一个序号

class Wathcher {
  constructor(vm, expoOrFn, cb, options) {
    this.vm = vm
    this.expoOrFn = expoOrFn
    this.cb = cb
    this.options = options
    this.deps = []  //这个watcher会存放所有的dep
    this.depsId = new Set()
    if (typeof expoOrFn == 'function') {
      this.getter = expoOrFn
    }

    this.id = id++
    this.get()
  }

  run() {
    this.get() //重新渲染
  }

  get() {
    
  }

  addDep(dep) {
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.depsId.add(id)   //存储有该watcher的所有dep.id
      this.deps.push(dep)   //存储有该watcher的所有dep
      dep.addSub(this)      //让当前dep 订阅这个watcher
    }
  }

  //视图更新
  update() {

  }
}

export default Wathcher