import { observe } from "./observe/index";
import Watcher from "./observe/watcher";

export function initState(vm) {
  const options = vm.$options;

  // 数据响应式
  if (options.data) {
    initData(vm);
  }

  // computed 响应式
  if (options.computed) {
    initComputed(vm);
  }

  // watcher 监听
  if (options.watch) {
    initWatch(vm);
  }
}

function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    },
  });
}

function initData(vm) {
  let data = vm.$options.data;
  // 如果是函数就拿到函数的返回值 否则就直接采用data作为数据源
  data = vm._data = typeof data === "function" ? data.call(vm) : data;

  // 属性劫持 采用defineProperty将所有的属性进行劫持

  // 我期望用户可以直接通过 vm.xxx 获取值， 也可以这样取值 vm._data.xxx
  for (let key in data) {
    proxy(vm, "_data", key);
  }
  observe(data);
}



function initWatch(vm) {
  const watch = vm.$options.watch;
  for (const key in watch) {
    let handler = watch[key]
    // 对当前属性进行创建watcher，watcher中存放的回调是handler，取数据是从vm上获取
    createWatcher(vm, key, handler)
  }
}
function createWatcher(vm, key, handler) {
  // handler 可以是对象
  let options
  if (typeof handler === 'object' && handler !== null) {
    options = handler
    handler = handler.handler
  }
  // 你可以判断如果handler 是一个字符串 可以采用实例上的方法
  if (typeof handler === 'string') {
    handler = vm[key]
  }
  return vm.$watch(key, handler, options) // (监听的变量名, 执行发函数, 监听配置)
}
export function stateMixin(Vue) {
  Vue.prototype.$watch = function(key, handler, options = {}) {
    const vm = this
    options.user = true
    const watcher = new Watcher(vm, key, handler, options)
    if (options.immediate) {
      handler.call(vm, watcher.value) // 第一次就触发
    }
  }
}