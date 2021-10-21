import { observe } from "./observe/index";
import Watcher from "./observe/watcher";
import Dep, { pushTarget } from "./observe/dep";

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

/********* data 数据响应式 start *********/
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
/********* data 数据响应式 end *********/



/********* computed 计算属性 start *********/
function initComputed(vm) {
  const computed = vm.$options.computed
  const watchers = vm._computedWatchers = {} // 存储所有的 component的 watcher
  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    watchers[key] = new Watcher(vm, getter, () => {}, { lazy: true })
    defineComputed(vm, key)
  }
}
function defineComputed(vm, key) {
  Object.defineProperty(vm, key, {
    get: createComputedGetter(key) // 改了重新计算， 没改取缓存
  })
}
function createComputedGetter(key) {
  return function() {
    const watcher = this._computedWatchers[key]
    if (watcher.dirty) { // 如果dirty:true就重新计算，否则就不算了 把以前的值返回
      watcher.evaluate() // 会调用用户定义的方法将返回值返回,此时dirty为false，并且用户的返回值存放到了watcher.value上
    }
    // 在求值的过程中 stack = [渲染watcher，计算属性watcher] Dep.target = 计算属性watcher
    // 当evaluate执行完毕后 stack = [渲染watcher]  Dep.target  = 渲染watcher
    // 计算属性是一个watcher  渲染是一个watcher
    
    if (Dep.target) { // 让计算属性watcher对应的两个dep 记录渲染watcher即可
      watcher.depend()
    }
    return watcher.value
  }
}
/********* computed 计算属性 end *********/




/********* watch 监听 start *********/
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
      handler.call(vm, watcher.value) // watch监听 第一次就触发
    }

    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
/********* watch 监听 end *********/
