// 整个自己编写的Vue的入口

import initMixin from "./init"
import { lifeCycleMixin } from "./lifecycle"

// es6的类 要求所有的扩展都在类的内部来进行扩展

function Vue(options){
    this._init(options);
}
initMixin(Vue)      // 后续在扩展都可以采用这种方式
lifeCycleMixin(Vue) // 给 Vue 实例添加方法

// 给Vue添加原型方法我们通过文件的方式来添加，防止所有的功能都在一个文件中来处理
export default Vue