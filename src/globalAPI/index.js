export default function initGlobalAPI(Vue) {
  Vue.options = {}
  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options)
    return this
  }
}

const LIFECYCLE_HOOKS = ['beforeCreate', 'mounted']
const strats = {}

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