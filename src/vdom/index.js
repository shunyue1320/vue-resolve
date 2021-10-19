export function createElement(vm, tag, data = {}, ...children) {
    return vnode(vm,tag,data,children,data.key,null)
}

export function createTextNode(vm,text) {
    return vnode(vm,undefined,undefined,undefined,undefined,text)
}

function vnode(vm,tag,data,children,key,text){
    return {
        vm,
        tag,
        data,
        children,
        key,
        text
        // ...
    }
}