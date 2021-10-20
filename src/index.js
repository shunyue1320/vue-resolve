// 整个自己编写的Vue的入口

import initMixin from "./init"
import { lifeCycleMixin } from "./lifecycle"
import { nextTick } from "./utils/nextTick"
import initGlobalAPI from "./globalAPI/index"
import { stateMixin } from "./state"

// es6的类 要求所有的扩展都在类的内部来进行扩展

function Vue(options){
    this._init(options);
}
initMixin(Vue)      // 后续在扩展都可以采用这种方式
stateMixin(Vue)
lifeCycleMixin(Vue) // 给 Vue 实例添加方法
initGlobalAPI(Vue) // 合并 options

Vue.prototype.$nextTick = nextTick

export default Vue