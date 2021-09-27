export function patch(oldVnode,vnode){     // oldVnode 可能是后续做虚拟节点的时候 是两个虚拟节点的比较
  const isRealElement = oldVnode.nodeType
  if(isRealElement){ // 如果有 说明他是一个 dom 元素
    const oldElm = oldVnode
    // 需要获取父节点 将当前节点的下一个元素作为参照物 将他插入，之后删除老节点
    const parentNode = oldElm.parentNode
    let el = createElm(vnode); // 根据虚拟节点
    parentNode.insertBefore(el,oldElm.nextSibling) // nextSibling: 父节点的 childNodes 列表中紧跟在其后面的节点
    parentNode.removeChild(oldElm)
    return el
  }
  // diff算法
}


function createElm(vnode) {
  let { tag, data, children, text } = vnode
  if(typeof tag === 'string'){                // 元素
    vnode.el = document.createElement(tag)    // 后续我们需要diff算法 拿虚拟节点比对后更新dom
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))  // 递归渲染
    })
  }else{ // 文本
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}