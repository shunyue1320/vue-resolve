export default function initGlobalAPI(Vue) {
  Vue.options = {}
  Vue.options.components = {}; // 用来存放全局组件的
  Vue.options._base = Vue;
  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options)
    return this
  }

  Vue.component = function (id, definition) {
    definition.name = definition.name || id // 只是做一个标识 ， 为了在自己家中可以使用自己 
    definition = this.options._base.extend(definition) // Vue.extend()
    this.options.components[id] = definition
  }

  // 每次使用组件 都是通过同一个对象生成的实例 Vue.component('id',{})
  Vue.extend = function (extendOptions) {
    const Super = this
    const Sub = function VueComponent(options) { // 后续会new 这个子类，做组件的初始化
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub

    // 由Vue.extend 传入的参数 和 全局的方法做的合并
    Sub.options = mergeOptions(Super.options, extendOptions)
    
    return Sub
  }
}

const LIFECYCLE_HOOKS = ['beforeCreate', 'mounted']
const strats = {}

// 组件的合并 全局组件会以原型链的方式赋值到我们的组件实例上
strats.components = (parant, child) => {
  const res = Object.create(parant) // xxx.__proto__ =  全局的组件
  if (child) {
    for (const key in child) {
      res[key] = child[key]
    }
  }
  return res
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = function(parentVal, childVal) {
    if (childVal) {
      if (parentVal) {
        return parentVal.concat(childVal)
      } else {
        return [ childVal ]
      }
    } else {
      return parentVal
    }
  }
})

// 合并两个对象
export function mergeOptions(parent, child) {
  const options = {}
  for (const key in parent) {
    mergeField(key)
  }
  for (const key in child) {
    if (!(key in parent)) {
      mergeField(key)
    }
  }

  function mergeField(key) {
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else {
      options[key] = child[key] || parent[key]
    }
  }

  return options
}