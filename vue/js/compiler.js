//作用：编译模板，解析指令v- / 差值表达式{{}} （操作dom）
//负责页面的首次渲染
//当数据变化时重新渲染视图

class Compiler {
  constructor(vm) {
    this.el = vm.$el
    this.vm = vm

    this.compile(this.el)
  }

  //编译模板，处理文本节点和元素节
  compile(el) {
    let childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      if (this.isTextNode(node)) {
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        this.compileElement(node)
      }

      //判断node是否还有子节点
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }

  //编译元素节点，处理指令
  compileElement(node) {
    Array.from(node.attributes).forEach(attr => {
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        //v-text --> text
        attrName = attrName.substr(2)
        let key = attr.value
        this.update(node, key, attrName)
      }
    })
  }

  update(node, key, attrname) {
    let updateFn = this[attrname + 'Updater']
    updateFn && updateFn.call(this, node, this.vm[key], key)
  }

  //处理v-text指令               （处理 元素 节点）
  textUpdater(node, value, key) {
    node.textContent = value

    //创建 watcher 对象，当数据改变更新视图
    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }

  //处理v-model指令              （处理 元素 节点）
  modelUpdater(node, value, key) {
    node.value = value

    //创建 watcher 对象，当数据改变更新视图
    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue
    })
    //双向数据绑定
    addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }

  //编译文本节点， 处理差值表达式 （处理 文本 节点）
  compileText(node) {
    let reg = /\{\{(.+?)\}\}/
    let value = node.textContent
    if (reg.test(value)) {
      let key = RegExp.$1.trim()
      node.textContent = value.replace(reg, this.vm[key])

      //创建 watcher 对象，当数据改变更新视图
      new Watcher(this.vm, key, (newValue) => {
        node.textContent = value.replace(reg, newValue)
      })
    }
  }

  //判断元素属性是否是指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }

  //判断节点是否是文本节点
  isTextNode(node) {
    return node.nodeType === 3
  }

  //判断节点是否是元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }
}