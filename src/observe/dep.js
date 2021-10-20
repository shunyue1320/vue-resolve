let did = 0

// 收集 watcher
class Dep {
  constructor() {
    this.id = did++
    this.watchers = []
  }
  depend() { // watcher 和 dep 是一个多对多的关系
    Dep.target.addDep(this) // 让 watcher 去记录 dep
  }
  addWatcher (watcher) {
    this.watchers.push(watcher)
  }
  notify () {
    this.watchers.forEach(watcher => watcher.update())
  }
}

Dep.target = null // 描述当前watcher是谁的
const stack = []  // 存放 updateCompent 与 用户 watch 的 watcher
export function pushTarget(watcher) {
  stack.push(watcher)
  Dep.target = watcher
}
export function popTarget(){
  stack.pop() // 删除最后一个 watcher
  Dep.target = stack[stack.length - 1]
}

export default Dep