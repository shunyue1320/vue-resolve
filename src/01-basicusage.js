import {h, init} from 'snabbdom'


//案例3：
//1.导入模块
// import style from 'snabbdom/modules/style'
// import eventlisteners from 'snabbdom/modules/eventlisteners'
// //2.注册模块
// let patch = init([
//   style,
//   eventlisteners
// ])
// //3.使用h()函数2参数
// let vnode = h('div', {
//   style: {
//     backgroundColor: 'red'
//   },
//   on: {
//     click: eventHandler
//   }
// },[
//   h('h1', 'hello snabbdom'),
//   h('p', 'pppppppppppppppppp'),
// ])

// function eventHandler() {
//   console.log('点击了')
// }

// let app = document.querySelector('#app')
// patch(app, vnode)




//案例1：
let patch = init([]) //对比差异 渲染页面
// (标签， 内容)
let vnode = h('dev#container.cls',{
  hook: {
    init (vnode) {
      console.log(vnode.elm)
    },
    create(emptyVnode, vnode) {
      console.log(vnode.elm)
    }
  }
}, 'hello world')

let app = document.querySelector('#app')

//对比返回vnode
let oldVnode = patch(app, vnode)

//对比 渲染页面
vnode = h('dev', 'hello snabbdom')

patch(oldVnode, vnode)






//案例2：
// let patch = init([])
// let vnode = h('dev#container', [
//   h('h1', 'hello snabbdom'),
//   h('p', 'pppppppppppppppppp'),
// ])

// let app = document.querySelector('#app')
// //oldVnode保存这一次更新dom的结果 方便下次对比
// let oldVnode = patch(app, vnode)

// //清空dom
// patch(oldVnode, h('!'))
