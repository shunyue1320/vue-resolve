// 整个自己编写的Vue的入口

import initMixin from "./init"
import { lifeCycleMixin } from "./lifecycle"
import { nextTick } from "./utils/nextTick"
import initGlobalAPI from "./globalAPI/index"

// es6的类 要求所有的扩展都在类的内部来进行扩展

function Vue(options){
    this._init(options);
}
initMixin(Vue)      // 后续在扩展都可以采用这种方式
lifeCycleMixin(Vue) // 给 Vue 实例添加方法

initGlobalAPI(Vue) // 合并 options

Vue.prototype.$nextTick = nextTick

// 给Vue添加原型方法我们通过文件的方式来添加，防止所有的功能都在一个文件中来处理


/************* diff 算法校验 start *************/
import { compileToFunction } from "./compiler/index";
import { createElm, patch } from "./vdom/patch";
let vm1 = new Vue({
    data: {
        name: '11111111',
        age: 11
    },
});
let template = `<div style="color:red">
    <li key="A">A</li>
    <li key="B">B</li>
    <li key="C">C</li>
    <li key="D">D</li>
</div>`
let render = compileToFunction(template);
let oldVnode = render.call(vm1);
let ele = createElm(oldVnode);
document.body.appendChild(ele); // 就让虚拟节点和真实节点做了映射

// diff算法的比对是平级比对
// 比对的时候 主要比对标签名和key 来判断是不是同一个元素 ，如果标签和key 都一样说明两个元素是同一个元素
let vm2 = new Vue({});
let newTemplate = `<div style="color:blue">
    <li key="M">M</li>
    <li key="Q">Q</li>
    <li key="D">D</li>
    <li key="E">E</li>
    <li key="F">F</li>
</div>`
let newRender = compileToFunction(newTemplate);
let newVnode = newRender.call(vm2);

// diff 算法校验
setTimeout(() => {
    patch(oldVnode, newVnode)
}, 2000);
/************* diff 算法校验 end *************/

export default Vue