<p align="center">
  <a href="https://github.com/shunyue1320/vue-resolve" target="_blank">
    <img width="150" src="https://cn.vuejs.org/images/logo.png" alt="logo">
  </a>
</p>

<div align="center">
<h3>vue.js青铜版</h3>

An Front-end technology sharing and exchange.

[![](https://img.shields.io/badge/Juejin-掘金-007FFF)](https://juejin.im/user/3702810894152983)
[![](https://img.shields.io/badge/CSDN-博客-E33E33)](https://blog.csdn.net/qq_41614928)
[![](https://img.shields.io/badge/Zhihu-知乎-0084FF)](https://www.zhihu.com/people/shun-yue-45)
[![](https://img.shields.io/badge/bilili-哔哩哔哩-FF69b4)](https://space.bilibili.com/475498258)
[![](https://img.shields.io/badge/公众号-爱看编程-7ED957)](#爱看编程)

</div>

## Use:
```js
//克隆代码到本地
git clone https://github.com/shunyue1320/vue-resolve.git

//安装依赖
yarn install

//将你的项目打包成vue.js 等同于将你开发的vue打包成一个文件库
yarn run build

// 打包时开启 --sourcemap 会额外生成一个vue.js.map的文件 
// 该文件对应计入了打包后的代码在源码内的位置 方便 在 Chrome DevTools -> surces 内调试
yarn run serve

//浏览
http://localhost:3000/public/index.html
```
### 本项目代码都是结合vue源码简化实现可放心品尝
##### 打包入口文件： `src/index.js`
##### 打包出口文件：`dist/vue.js`
##### 测试文件：  `public/index.html`

##### 项目主文件都在src文件夹内

### 各文件夹的功能简介：
```js
- compiler       //作用：存储编译器核心代码 目的：将节点outerHTML文本转换成render函数
  - generator.js //作用：将ast树 => render函数的字符串形式
  - index.js     //作用：将outerHTML树 => render函数
  - parser.js    //作用：将outerHTML树 => ast树 通过正则找出outerHTML文本的 标签 属性 子元素

- global-api     //作用：vue的全局api存放处 如：use mixin component directive
  - index.js     //作用：实现vue.mixin全局混入方法

- observer       //作用：vue数据响应式 订阅发布模式
  - array.js     //作用：重写数组7方法监听数组变化渲染更新页面
  - dep.js       //作用：订阅者 每个响应式属性一个dep 存储与它对应的watcher
  - index.js     //作用：利用js的defineProperty对 对象与数组 数据进行响应式
  - scheduler.js //作用：实现vue的nextTick方法 利用js宏微任务机制将watcher缓存去重后执行
  - watcher.js   //作用：存储渲染组件的updateComponent方法当响应式数据变化时执行对应的watcher内的update方法

- vdom                //作用：diff算法的核心文件比较两个vnode寻找不同渲染页面
  - create-element.js //作用：创建vnode的格式
  - patch.js          //作用：负责完成两个vnode的diff算法比较 更新视图

- index.js       //作用：Vue初始化文件 new Vue({}) 时执行的入口文件
- init.js        //作用：数据响应式 outerHTML文本转换成render函数 mountComponent挂载页面
- lifecycle.js   //作用：页面挂载时使用Watcher监听redner函数 因为页面第一次挂载render函数内有很多属性调用get 此时便可给这些属性添加该Watcher
- render.js      //作用：为字符串转成的redner方法提供this指向与函数调用
- state.js       //作用：将vm.$options.data的数据代理到this上可vue直接通过this访问该数据的原因 并且将数据响应式
- utils.js       //作用：vue内部的公共方法 类似项目内的公共方法 全局调用使用

- .babelrc.js     //作用：自动将ES2015+的代码转换为es5
- rollup.config.js//作用：rollup打包的配置文件
```
