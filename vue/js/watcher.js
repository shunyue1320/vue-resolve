//观察者

class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    //data中的属性名称
    this.key = key
    //回调函数负责更新视图
    this.cb = cb

    //把watcher对象记录到Dep类的静态属性target
    Dep.target = this
    //触发get方法，调用addSub
    this.oldValue = vm[key]
    Dep.target = null       //以便于下次调用addSub添加当前this入Dep
  }

  //当数据发生变化时更新视图
  update() {
    let newValue = this.vm[this.key]
    if (this.oldValue === newValue) {
      return
    }
    this.cb(newValue)
  }
}