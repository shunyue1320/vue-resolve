export function createElement(vm, tag, data = {}, ...children) {
    // 可能要创造组件的虚拟节点
    if (isReveredTag(tag)) {
        // 创建元素的虚拟节点
        return vnode(vm, tag, data, children, data.key, null)
    } else {
        // 创造组件的虚拟节点 ， 组件需要找到组件的模板去进行渲染
        let Ctor = vm.$options.components[tag] // 可能是对象 也有可能是一个类
        // 稍后我们会初始化组件 需要组件的构造函数
        return createComponent(vm, tag, data, children, data.key, Ctor);
    }
}

const init = (vnode) => {
    const child = vnode.componentInstance = new vnode.componentOptions.Ctor({}) // 放插槽属性
    child.$mount()
}

function  isReveredTag(tag) {
    const tagList = ['a', 'div', 'img', 'button', 'input', 'p', 'span'];
    return tagList.includes(tag)
}

function createComponent(vm, tag, data, children, key, Ctor) {
    if (typeof Ctor === 'object' && Ctor !== null) {
        const VueCtor = vm.$options._base
        Ctor = VueCtor.extend(Ctor)
    }
    data.hook = { // 稍后我们通过虚拟节点创造真实节点的时候 ，就调用这个init方法
        init
    }
    return vnode(vm, tag, data, undefined, key, undefined, { Ctor, children });
}

export function createTextNode(vm,text) {
    return vnode(vm,undefined,undefined,undefined,undefined,text)
}

function vnode(vm,tag,data,children,key,text,componentOptions){
    return {
        vm,
        tag,
        data,
        children,
        key,
        text,
        componentOptions
        // ...
    }
}