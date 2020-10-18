// vue的工具方法

export function inObject(obj) {
  return typeof obj === 'object' && obj !== null
}

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated'
]

let strats = {}
//钩子拼接
function mergeHook(parentVal, childVal) {
  if (childVal) {     //子级有
    if (parentVal) {  //父级有
      return parentVal.concat(childVal) //同名生命周期数组
    } else {
      return [ childVal ]
    }
  } else {            //子级没有
    return parentVal
  }
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

export function mergeOptions (parent, child) {
  const options = {}
  //父级属性
  for (let key in parent) {
    mergeField(key)
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) { //新属性
      mergeField(key)
    }
  }

  function mergeField (key) {
    if (strats[key]) { //是钩子
      options[key] = strats[key](parent[key], child[key])
    } else if (isObject(parent[key]) && isObject(child[key])) { //是对象
      options[key] = Object.assign(parent[key], child[key])
    } else {
      if (child[key] == null) {
        options[key] = parent[key];
      } else {
        options[key] = child[key];
      }
    }
  }

  return options
}