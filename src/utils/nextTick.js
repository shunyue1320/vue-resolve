let callbacks = []
let waiting = false
function flushCallbacks(){
  waiting = false; 
  // 默认第一次会将两次的nextTick 都维护到callbacks中 [用户的，页面渲染的]
  let cbs = callbacks.slice(0);
  callbacks = [];
  cbs.forEach(cb=>cb());
}

// 异步任务分为 两种 宏任务、微任务
// 宏任务 setTimeout setImmediate(ie下支持性能优于setTimeout)
// 微任务 promise.then mutationObserver
// vue在更新的时候希望尽快的更新页面 promise.then  mutationObserver  setImmediate setTimeout
// vue3不在考虑兼容性问题了 所以后续vue3中直接使用promise.then

let timeFunc
if (typeof Promise !== 'undefined') {
  let p = Promise.resolve()
  timeFunc = () => {
    p.then(flushCallbacks)
  }
} else if (typeof MutationObserver !== 'undefined') {
  let observer = new MutationObserver(flushCallbacks) // mutationObserver放的回调是异步执行的
  let textNode = document.createTextNode(1) // 文本节点内容先是 1
  observer.observe(textNode,{ characterData: true })
  timeFunc = () => {
    textNode.textContent = 2 // 改成了2  就会触发更新了
  }
} else if (typeof setImmediate !== 'undefined') {
  timeFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timeFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(cb) {
  callbacks.push(cb)
  if (!waiting) {
    waiting = true
    timeFunc()
  }
}