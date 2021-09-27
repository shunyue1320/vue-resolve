import { initState } from "./state";
import { compileToFunction } from "./compiler/index";
import { mountComponent } from "./lifecycle";

export default function initMixin(Vue) {
    Vue.prototype._init = function(options) {
        const vm = this;
        vm.$options = options // 所有后续的扩展方法都有一个$options选项可以获取用户的所有选项
        // 对于实例的数据源 props data methods computed watch
        // props data
        initState(vm);
        // vue中会判断如果是$开头的属性不会被变成响应式数据



        // 状态初始化完毕后需要进行页面挂载
        if (vm.$options.el) { // el 属性 和直接调用$mount是一样的
            vm.$mount(vm.$options.el)
        }
    }
    Vue.prototype.$mount = function(el) {
        const vm = this;
        el = document.querySelector(el);
        const options = vm.$options;
        if (!options.render) {
            let template = options.template;
            if (!template) { // render 和 template 都没有的情况下才获取 outerHTML
                template = el.outerHTML
            }
            // 将template变成render函数

            // 创建render函数 -》 虚拟dom  -》 渲染真实dom
            console.log("html 初始值", template)
            const render =  compileToFunction(template); // 开始编译
            options.render = render;
        }
        mountComponent(vm,el)
        console.log("render =", options.render.toString())
    }
}