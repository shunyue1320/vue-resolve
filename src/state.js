import { observe } from './observer/index.js'

export function initState(vm) {
  const opts = vm.$options

  //props属性
  if (opts.props) {
    initProps(vm)
  }

  //data数据
  if (opts.data) {
    initData(vm)
  }

  // computed ... watch

  //methods方法
  if (opts.methods) {
    initMethod(vm)
  }
}

function initProps() {}
function initMethod() {}
function proxy(vm, property, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[property][key]
    },
    set(newValue) {
      vm[property][key] = newValue
    }
  })
}

function initData(vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data
  for (const key in data) {
    proxy(vm, '_data', key) //数据代理至vm
  }
  observe(data)             //数据响应式
}