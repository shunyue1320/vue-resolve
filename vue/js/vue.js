class Vue {
  constructor(options) {
    //1. 通过属性保存选项的数据
    this.$options = options || {}
    this.$data = options.data || {}
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    
    //2. 把 data 中的成员转换成 getter 和 setter, 注入实例中
    this._proxyData(this.$data)
    //3. 调用 observer 对象， 监听数据的变化
    new Observer(this.$data)
    //4. 调用 compiler 对象， 解析指令和差值表达式
    new Compiler(this)
  }
  _proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,   //可枚举
        configurable: true, //可改变
        get() {
          return data[key]
        },
        set(newValue) {
          if (data[key] === newValue) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }
}