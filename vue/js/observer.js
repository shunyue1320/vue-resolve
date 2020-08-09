//作用：负责给$data内变量添加 getter 和 setter 方法
//当重新赋值时添加 getter 和 setter 方法

class Observer {
  constructor(data) {
    this.walk(data)
  }
  walk(data) {
    //1. 判断data是否是对象
    if (!data || typeof data !== 'object') {
      return
    }
    //2. 遍历data对象的所有属性
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  //val的作用是解决栈溢出
  defineReactive(obj, key, val) {
    let that = this
    //收集依赖发送通知 每个属性一个Dep
    let dep = new Dep()
    
    //如果val是则将val内部属性转换成响应式数据
    this.walk(val) //为啥vue.js内对象不需要转换成响应式数据? 因为里面的对象同地址设置一个就都设置了
    Object.defineProperty(obj, key, {
      enumerable: true,   //可枚举
      configurable: true, //可改变
      get() {
        Dep.target && dep.addSub(Dep.target)  //1.订阅
        return val        //如果返回 obj[key] 则获取obj[key]时又会触发get方法形成栈溢出
      },
      set(newValue) {
        if (val === newValue) {
          return
        }
        val = newValue
        //重新赋的值转换成响应式数据
        that.walk(newValue)
        dep.notify()       //2.发布
      }
    })
  }
}