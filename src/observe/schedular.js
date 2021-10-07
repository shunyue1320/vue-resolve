import { nextTick } from "../utils/nextTick"
let queue = []
let has = {}
let pending = false

function flushSchedularQueue() {
  queue.forEach(Watcher => Watcher.run())
  queue = []
  has = {}
  pending = false
}

export function queueWatcher(watcher) {
  let id = watcher.id
  if (has[id] == null) {
    queue.push(watcher)
    has[id] = true
    if (!pending) {
      nextTick(() => { // 万一一个属性 对应多个更新，那么可能会开启多个定时器
        flushSchedularQueue() // 批处理操作 ， 防抖
      })
      pending = true
    }
  }
}