// vue的工具方法

export function isObject(obj) {
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
/*** 钩子拼接 将同名钩子函数拼接成数组 ***/
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

/*** 选项拼接 ***/
export function mergeOptions (parent, child) {
  const options = {}  //合并存储容器

  //父选项
  for (let key in parent) {
    mergeField(key)
  }

  //新增选项
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }

  /*** 判断各选项类型 执行对应的合并逻辑 ***/
  function mergeField (key) {
    if (strats[key]) { //是钩子
      options[key] = strats[key](parent[key], child[key])
    } else if (isObject(parent[key]) && isObject(child[key])) { //是对象
      options[key] = Object.assign(parent[key], child[key])
    } else {           //是方法
      if (child[key] == null) {
        options[key] = parent[key];
      } else {
        options[key] = child[key];
      }
    }
  }

  return options
}