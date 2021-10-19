export function patch(oldVnode,vnode){     // oldVnode 可能是后续做虚拟节点的时候 是两个虚拟节点的比较
  console.log("oldVnode", oldVnode, "vnode", vnode)
  const isRealElement = oldVnode.nodeType
  if(isRealElement){ // 如果有 说明他是一个 dom 元素 (直接挂载 不需要 diff)
    const oldElm = oldVnode
    // 需要获取父节点 将当前节点的下一个元素作为参照物 将他插入，之后删除老节点
    const parentNode = oldElm.parentNode
    let el = createElm(vnode); // 根据虚拟节点
    parentNode.insertBefore(el,oldElm.nextSibling) // nextSibling: 父节点的 childNodes 列表中紧跟在其后面的节点
    parentNode.removeChild(oldElm)
    return el
  } else {
    // diff算法
    patchVnode(oldVnode, vnode);
    return vnode.el
  }
}

function patchVnode(oldVnode, vnode) {
  // case1: 前后两个虚拟节点不是相同节点直接替换掉即可
  if (!isSameVnode(oldVnode, vnode)) {
    return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
  }

  // 标签一样我们就复用节点
  let el = vnode.el = oldVnode.el

  // case2：两个元素虚拟节点都是文本的情况下 用新文本换掉老的文本即可
  if (!oldVnode.tag) { // 是文本
    if (oldVnode.text !== vnode.text) {
      return el.textContent = vnode.text
    }
  }

  // case3: 两个都是标签 比较属性
  updateProperties(vnode, oldVnode.data)

  // case4: 比较儿子节点
  let oldChildren = oldVnode.children || []
  let newChildren = vnode.children || []

  // (1). 两方都有儿子 
  if (oldChildren.length > 0 && newChildren.length > 0) {
    // diff算法是一层层的比较 不涉及到跨级比较
    updateChildren(el, oldChildren, newChildren)
  }
  // (2). 一方有儿子 一方没儿子 
  else if (newChildren.length > 0) {
    for (let i = 0; i < newChildren.length; i++) {
      el.appendChild(createElm(newChildren[i]))
    }
  } else if (oldChildren.length > 0) {
    el.innerHTML = '' // 清空子节点
  }
}

// 是否是同一元素
function isSameVnode(n1, n2) {
  return n1.tag == n2.tag && n1.key === n2.key
}

export function createElm(vnode) {
  let { tag, data, children, text } = vnode
  if(typeof tag === 'string'){                // 元素
    vnode.el = document.createElement(tag)    // 后续我们需要diff算法 拿虚拟节点比对后更新dom
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))  // 递归渲染
    })

    // 样式类名....
    updateProperties(vnode)
  }else{ // 文本
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

// 更新节点的 style 与 props
function updateProperties(vnode, oldProps = {}) {
  let newProps = vnode.data || {}
  // 老的props 
  // 属性的diff算法
  let el = vnode.el
  // 比较sytle 特殊一些 需要看下样式
  let oldStyle = oldProps.style || {}
  let newStyle = newProps.style || {}
  for (let key in oldStyle) {
    if (!(key in newStyle)) {
      el.style[key] = ''
    }
  }
  for (let key in oldProps) {
    if (!(key in newProps)) {
      el.removeAttribute(key)
    }
  }
  for (let key in newProps) {
    if (key === 'style') {
      for (let styleKey in newProps[key]) {
        el.style[styleKey] = newProps[key][styleKey]
      }
    } else if (key === 'class') {
      el.className = newProps[key]
    } else {
      el.setAttribute(key, newProps[key])
    }
  }
}


// diff算法采用了双指针的方式进行比对，并且是O(n)
function updateChildren(el, oldChildren, newChildren) {
  // vue中创建了4个指针 分别指向 老孩子和新孩子的头尾
  // 分别依次进行比较有一方先比较完毕就结束比较
  let oldStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newStartIndex = 0;
  let newEndIndex = newChildren.length - 1;

  let oldStartVnode = oldChildren[0];
  let oldEndVnode = oldChildren[oldEndIndex];
  let newStartVnode = newChildren[0];
  let newEndVnode = newChildren[newEndIndex];

  // 有一方比完就停止  儿子的规模变大而变大 O(n)

  function makeIndexByKey(children) {
    return children.reduce((memo, current, index) => (memo[current.key] = index, memo), {})
  }
  let map = makeIndexByKey(oldChildren)

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 这里在优化dom的常见操作 向前追加 向后追加  尾部移动头部
    // 复用节点
    if (!oldStartVnode) {      // [ C1 C2 null C4 C5 ]  (oldStartIndex = null -> C4)
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if (!oldEndVnode) { // [ C1 C2 C3 C4 unll ]  (oldEndVnode = null -> C4) 
      oldEndVnode = oldChildren[--oldEndIndex]


      /* 
      O1 == N1
      oldChildrens: [O1 O2 O3]
      newChildrens: [N1 N2 N3]
      */
    } else if (isSameVnode(oldStartVnode, newStartVnode)) { // true则: 说明两个元素是同一个元素 要比较属性，和他的儿子
      patchVnode(oldStartVnode, newStartVnode) // 递归比较他们的儿子
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]


      // O3 == N3
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]

      /* 
      O3 == N1
      oldChildrens: [O1 O2 O3]
      newChildrens: [N1 N2 N3]

      childrenElements: [O1 O2 O3] => [O3 O1 O2] // html节点移动
      */
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode)
      el.insertBefore(oldEndVnode.el, oldStartVnode.el) // oldEndVnode 节点移动到 oldStartVnode 前面
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]

      /* 
      O1 == N3
      oldChildrens: [O1 O2 O3]
      newChildrens: [N1 N2 N3]

      childrenElements: [O1 O2 O3] => [O2 O3 O1]
      */
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling) // oldStartVnode 节点移动到 oldEndVnode 后面
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    }

    // 会根据key进行diff算法 ， 所以在使用的时候如果列表是可操作的，尽量避开用index作为key
    else {
      // 乱序比对 我们需要尽可能找出能复用的元素出来
      let moveIndex = map[newStartVnode.key]
      if (moveIndex == undefined) {
        // 不用复用直接创建插入即可
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      } else {
        // 有的话直接移动老的节点
        let moveVnode = oldChildren[moveIndex];
        oldChildren[moveIndex] = undefined
        el.insertBefore(moveVnode.el, oldStartVnode.el);
        patchVnode(moveVnode, newStartVnode); // 比属性 比儿子
      }
      newStartVnode = newChildren[++newStartIndex]
    }
  }

  // 将新增的直接插入 (newChildren 剩下的 vnode 是需要新增的)
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let nextEle = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el
      // nextEle 可能是一个dom元素 可能是null 是null insertBefore会被变成appendChild
      el.insertBefore(createElm(newChildren[i]), nextEle)
    }
  }

  // 删除老的多余元素 (oldChildren 剩下的 vnode 是需要删除的)
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i] !== undefined) {
        el.removeChild(oldChildren[i].el)
      }
    }
  }
}
// Vue3采用了最长递增子序列，找到最长不需要移动的序列，从而减少了移动操作