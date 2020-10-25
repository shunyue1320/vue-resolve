(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // vue的工具方法
  function isObject(obj) {
    return _typeof(obj) === 'object' && obj !== null;
  }
  var LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated'];
  var strats = {};
  /*** 钩子拼接 将同名钩子函数拼接成数组 ***/

  function mergeHook(parentVal, childVal) {
    if (childVal) {
      //子级有
      if (parentVal) {
        //父级有
        return parentVal.concat(childVal); //同名生命周期数组
      } else {
        return [childVal];
      }
    } else {
      //子级没有
      return parentVal;
    }
  }

  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });
  /*** 选项拼接 ***/

  function mergeOptions(parent, child) {
    var options = {}; //合并存储容器
    //父选项

    for (var key in parent) {
      mergeField(key);
    } //新增选项


    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }
    /*** 判断各选项类型 执行对应的合并逻辑 ***/


    function mergeField(key) {
      if (strats[key]) {
        //是钩子
        options[key] = strats[key](parent[key], child[key]);
      } else if (isObject(parent[key]) && isObject(child[key])) {
        //是对象
        options[key] = Object.assign(parent[key], child[key]);
      } else {
        //是方法
        if (child[key] == null) {
          options[key] = parent[key];
        } else {
          options[key] = child[key];
        }
      }
    }

    return options;
  }

  //获取数组原型上的方法
  var arrayProto = Array.prototype; //克隆一个原型方法

  var arrayMethods = Object.create(arrayProto); //7个改变数组的方法

  var methods = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice']; //封装7个改变数组的方法 原因：当改变数组数据时需要视图更新

  methods.forEach(function (method) {
    //在vue内执行改变数组的方法 其实就是执行以下的方法
    arrayMethods[method] = function () {
      var ob = this.__ob__;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = arrayProto[method].apply(this, args); //给增加的新数据进行响应式

      var inserted;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
      }

      inserted && ob.observeArray(inserted); // ob.dep.notify() //视图更新

      return result;
    };
  });

  var id = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id++;
      this.subs = [];
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 1. 让dep 记住watcher
        // 2. 让watcher 记住dep 双向记忆
        Dep.target.addDep(this); //让wacher 存储 dep
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null; //默认为null

  function pushTarget(watcher) {
    //栈添加
    Dep.target = watcher; //  stack.push(watcher) // []
  }
  function popTarget() {
    //栈删除
    Dep.target = null; //   stack.pop();
    //   Dep.target = stack[stack.length-1];
  }
  // dep 和 watcher 是一个多对多的关系
  // 每个组件一个diff的逻辑 也就是每个组件一个watcher 也就是组件页面内多个响应式属性指向一个watcher
  // 每个属性对应一个dep 而dep内存储多个watcher 也就是该dep出现在多个watcher内 说明该属性存在多个组件页面内响应式显示

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //__ob__ 一个响应式标记 作用：将当前this'继承'给需响应的对象或数组
      Object.defineProperty(data, '__ob__', {
        value: this,
        //指向this
        enumerable: false,
        //不可枚举
        configurable: false
      }); //判断数组响应式

      if (Array.isArray(data)) {
        data.__proto__ = arrayMethods; //替换封装的原型方法

        this.observeArray(DataCue);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        for (var i = 0; i < data.length; i++) {
          observe(data[i]);
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        var _this = this;

        Object.keys(data).forEach(function (key) {
          _this.defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "defineReactive",
      value: function defineReactive(data, key, value) {
        observe(value); //递归 所有数据响应式

        var dep = new Dep(); //每个属性一个

        Object.defineProperty(data, key, {
          get: function get() {
            if (Dep.target) {
              //将Dep.target赋值后再调用get方法就可以给该属性添加一个wacher
              dep.depend(); //添加watcher
            }

            return value;
          },
          set: function set(newValue) {
            if (newValue === value) return;
            observe(newValue); //给新数据响应式

            value = newValue; //视图更新

            dep.notify();
          }
        });
      }
    }]);

    return Observer;
  }();

  function observe(data) {
    //不是对象或=null不监控
    if (!isObject(data)) {
      return;
    } //对象已监控 则跳出


    if (data.__ob__ instanceof Observer) {
      return;
    }

    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; //props属性

    if (opts.props) ; //data数据


    if (opts.data) {
      initData(vm);
    } // computed ... watch
    //methods方法


    if (opts.methods) ;
  }

  function proxy(vm, property, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[property][key];
      },
      set: function set(newValue) {
        vm[property][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;

    for (var key in data) {
      proxy(vm, '_data', key); //数据代理至vm
    }

    observe(data); //数据响应式
  }

  // 字母a-zA-Z_ - . 数组小写字母 大写字母  
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名
  // ?:匹配不捕获   <aaa:aaa>

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // startTagOpen 可以匹配到开始标签 正则捕获到的内容是 (标签名)

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名
  // 闭合标签 </xxx>  

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>
  // <div aa="123" bb=123  cc='123'
  // 捕获到的是 属性名 和 属性值 arguments[1] || arguments[2] || arguments[2]

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
  // <div > | <br/>

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
  function parseHTML(html) {
    var root; //存储编译出来的ast树

    var currentParent; //存储当前编译标签的父级标签
    //借助栈型结构判断标签是否正常闭合<div>对应<div>
    //执行过程中匹配到标签处理后push入stack 以此类推 例如：当push入一个</div>时上一个push的肯定是<div>如果不是则报错，如果是则将他们出栈 等待校验下一个push的标签

    var stack = []; //结构树结构 html = <div id='app'><span>{{name}}</span></div>

    while (html) {
      var textEnd = html.indexOf('<');

      if (textEnd == 0) {
        var startTageMatch = parseStartTag(); // { tagName: 'div', attrs: [] }
        //开始标签

        if (startTageMatch) {
          start(startTageMatch.tagName, startTageMatch.attrs);
        } //结束标签


        var endTagMatch = html.match(endTag); //[ "</div>", "div", index: 0 ]

        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
        }
      } //如果不是0 说明是文本


      var text = void 0;

      if (textEnd > 0) {
        text = html.substring(0, textEnd); //截取标签前面的文本

        chars(text);
      }

      if (text) {
        advance(text.length); //编译推进
      }
    } //匹配该标签内的所有属性 return { tagName: 'div', attrs: [] }


    function parseStartTag() {
      var start = html.match(startTagOpen); // ["<div", "div", index: 0, ...]

      if (start) {
        var match = {
          tagName: start[1],
          attrs: [] //属性

        };
        advance(start[0].length); //编译推进 html => id='app'><span>{{name}}</span></div>

        var _end, attr; // !匹配开头是> && 匹配属性  意思：匹配该标签内的所有属性


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          //attr => [ 0: "id='app'", 1: "id", 2: "=", 3: undefined, 4: "app", 5: undefined ]
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length); //编译推进
        }

        if (_end) {
          advance(_end[0].length); //编译推进

          return match;
        }
      }
    } //开始标签 每次解析开始标签 都会执行此方法


    function start(tagName, attrs) {
      var element = createASTElement(tagName, attrs);

      if (!root) {
        root = element; //只有第一次是根
      }

      currentParent = element;
      stack.push(element);
    }

    function end(tagName) {
      var element = stack.pop();
      currentParent = stack[stack.length - 1];

      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    } //处理文本


    function chars(text) {
      text = text.replace(/\s/g, '');

      if (text) {
        //加入currentParent的子元素内
        currentParent.children.push({
          type: 3,
          text: text
        });
      }
    } //编译推进 将已编译完成的字符串去除


    function advance(n) {
      html = html.substring(n);
    } // 常见数据结构 栈 队列 数组 链表 集合 hash表 树


    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        attrs: attrs,
        children: [],
        parent: null,
        type: 1 //1:元素  3:文本

      };
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //作用： 'helloworld{{ msg}}aa{{bb}}aaa'  => _v('helloworld'+_s(msg)+"aa" + _s(bb))

  function gen(node) {
    if (node.type === 1) {
      //节点里面有children 继续遍历
      return generate(node);
    } else {
      //文本则处理
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        //没有有变量 {{}}
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        //存在变量
        var tokens = [];
        var match, index;
        var lastIndex = defaultTagRE.lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          //匹配出所有变量
          index = match.index;
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          tokens.push("_s(".concat(match[1].trim(), ")")); //获取变量名

          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(el) {
    var children = el.children;

    if (children) {
      return children.map(function (c) {
        return gen(c);
      }).join(',');
    } else {
      return false;
    }
  } //作用：[ {name:'id', value: 'divid'}, {name: 'style', value: 'color: aqua;font-size: 30px;'} ] 
  //  => {id:'divid', style:{color: 'aqua', font-size: '30px'}}


  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function generate(el) {
    var children = genChildren(el);
    var attrs = el.attrs.length ? genProps(el.attrs) : undefined;
    var code = "_c(\"".concat(el.tag, "\", ").concat(attrs, " ").concat(children ? ",".concat(children) : '', ")");
    return code;
  }

  function compileToFunctions(template) {
    //1. 将outerHTML 转换成 ast树
    var ast = parseHTML(template); // { tag: 'div', attrs, parent, type, children: [...] }
    // console.log("AST:", ast)
    //2. ast树 => 拼接字符串

    var code = generate(ast); //return _c('div',{id:app,style:{color:red}}, ...children)

    code = "with(this){ \r\n return ".concat(code, " \r\n }"); // console.log("code:", code)
    //3. 字符串 => 可执行方法

    var render = new Function(code);
    /**如下：
    * render(){ 
    *   with(this){
    *     return _c('div',{id:app,style:{color:red}},_c('span',undefined,_v("helloworld"+_s(msg)) ))
    *   }
    * }
    * 
    */

    return render;
    /**
     * 编译原理的3个步骤：
     * 1. outerHTML    => ast树
     * 2. ast树        => render字符串
     * 3. render字符串 => render方法
     */
  }

  var has = {}; // vue源码里有的时候去重用的是set 有的时候用的是对象来实现的去重

  var queue = []; // 这个队列是否正在等待更新

  function flushSchedulerQueue() {
    for (var i = 0; i < queue.length; i++) {
      queue[i].run(); // 执行 watcher 内部的 updateComponent 方法 更新页面
    }

    queue = [];
    has = {};
  } //由于多个元素指向同一个 watcher 所以更新的时候需要把这些 watcher 集中起来 去重后一起执行
  //原因：如果每匹配一个元素就执行一个 watcher 这样重复执行了许多相同的 watcher 性能大大下降


  function queueWatcher(watcher) {
    var id = watcher.id;

    if (has[id] == null) {
      has[id] = true; // 如果没有注册过这个watcher，就注册这个watcher到队列中，并且标记为已经注册

      queue.push(watcher); // watcher 存储了updateComponent方法 用来更新页面

      console.log("queuequeue---", queue);
      nextTick(flushSchedulerQueue); // flushSchedulerQueue 调用渲染watcher
    }
  } // 1. callbacks[0] 是flushSchedulerQueue函数 当监听组件data数据改变时会执行dep.notify()方法
  // 2. dep.notify()方法将所有触发的 watcher 传递给 queueWatcher 方法
  // 3. queueWatcher方法会对 watcher 进行去重 当所有组件data改变都监听完后 flushCallbacksQueue 开始工作

  var callbacks = []; // [flushSchedulerQueue,fn]

  var pending = false;

  function flushCallbacksQueue() {
    callbacks.forEach(function (fn) {
      return fn();
    });
    pending = false;
  } //上面22行第一次进入nextTick就开启了一个定时器 执行 nextTick 进来的回调函数
  //由于js定时器为宏观任务，定时器会等到所有微观任务都执行后才会执行定时器
  //所以当组件内的nextTick回调都一个个添加 callbacks 内且页面完全渲染后会触发 flushCallbacksQueue 方法


  function nextTick(fn) {
    callbacks.push(fn); // 防抖

    if (!pending) {
      // true  事件环的概念 promise mutationObserver setTimeout setImmediate
      setTimeout(function () {
        flushCallbacksQueue(); //清除回调队列
      }, 0);
      pending = true;
    }
  }

  var id$1 = 0; // 做一个watcher 的id 每次创建watcher时 都有一个序号

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, expoOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.expoOrFn = expoOrFn;
      this.cb = cb;
      this.options = options;
      this.deps = []; //这个watcher会存放所有的dep

      this.depsId = new Set();

      if (typeof expoOrFn == 'function') {
        this.getter = expoOrFn;
      }

      this.id = id$1++;
      this.get();
    }

    _createClass(Watcher, [{
      key: "run",
      value: function run() {
        this.get(); //重新渲染
      }
    }, {
      key: "get",
      value: function get() {
        // 1.是先把渲染watcher 放到了 Dep.target上
        // 2.this.getter()  是不是去页面取值渲染  就是调用defineProperty的取值操作
        // 3.我就获取当前全局的Dep.target,每个属性都有一个dep 取值是就将Dep.target 保留到当前的dep中
        // 4.数据变化 通知watcher 更新 
        pushTarget(this); // 在取值之前 将watcher先保存起来

        this.getter(); // 这句话就实现了视图的渲染  -> 操作是取值 

        popTarget(); // 删掉watcher
        // Vue是组件级别更新的
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.depsId.add(id); //存储有该watcher的所有dep.id

          this.deps.push(dep); //存储有该watcher的所有dep

          dep.addSub(this); //让当前dep 订阅这个watcher
        }
      } //视图更新

    }, {
      key: "update",
      value: function update() {
        queueWatcher(this); // 将watcher存储起来
      }
    }]);

    return Watcher;
  }();

  //diff算法核心文件 vnode比较得出最终dom
  function patch(oldVnode, newVnode) {
    var isRealElement = oldVnode.nodeType; // 真实元素

    if (isRealElement) {
      var oldElm = oldVnode;
      var parentElm = oldElm.parentNode; //body

      var el = createElm(newVnode);
      parentElm.insertBefore(el, oldElm.nextSibling);
      parentElm.removeChild(oldElm);
      return newVnode;
    } else {
      // dom diff 算法  同层比较 不需要跨级比较
      // 两棵树 要先比较树根一不一样，再去比儿子长的是否一样
      //1. 标签名不一致
      if (oldVnode.tag !== newVnode.tag) {
        oldVnode.el.parentNode.replaceChild(createElm(newVnode), oldVnode.el);
      } //2. 旧节点是文本节点 直接用新的文本替换掉老的文本


      if (!oldVnode.tag) {
        if (oldVnode.text !== newVnode.text) {
          oldVnode.el.textContent = newVnode.text;
        }
      } // 一定是标签了 而且标签一致
      // 需要复用老的节点 替换掉老的属性


      var _el = newVnode.el = oldVnode.el; // 更新属性  diff 属性


      updateProperties(newVnode, oldVnode.data); //属性更新
      //对比children子元素

      var oldChildren = oldVnode.children || [];
      var newChildren = newVnode.children || [];
      /*** 下面3种核心比较 ***/
      //1. 新老都有子节点  vnode比较    diff核心
      //2. 老的有子节点   新的没子节点  直接删除
      //3. 新的有子节点   老的没子节点  直接插入

      if (oldChildren.length > 0 && newChildren.length > 0) {
        updateChildren(_el, oldChildren, newChildren);
      } else if (oldChildren.length > 0) {
        _el.innerHTML = '';
      } else if (newChildren.length > 0) {
        for (var i = 0; i < newChildren.length; i++) {
          var child = newChildren[i];

          _el.appendChild(createElm(child));
        }
      }

      return newVnode;
    }
  } //判断两节点是否相同 (key + type 进行判断)

  function isSameVnode(oldVnode, newVnode) {
    return oldVnode.key == newVnode.key && oldVnode.tag === newVnode.tag;
  } //两子节点比对


  function updateChildren(parent, oldChildren, newChildren) {
    var oldStartIndex = 0; // 老的开始的索引

    var oldStartVnode = oldChildren[0]; // 老的开始

    var oldEndIndex = oldChildren.length - 1; // 老的尾部索引

    var oldEndVnode = oldChildren[oldEndIndex]; // 获取老的孩子的最后一个

    var newStartIndex = 0; // 老的开始的索引

    var newStartVnode = newChildren[0]; // 老的开始

    var newEndIndex = newChildren.length - 1; // 老的尾部索引

    var newEndVnode = newChildren[newEndIndex]; // 获取老的孩子的最后一个

    function makeIndexByKey(children) {
      // 只需要创建一次 映射表
      var map = {};
      children.forEach(function (item, index) {
        map[item.key] = index;
      });
      return map;
    }

    var map = makeIndexByKey(oldChildren); // 根据老的孩子的key 创建一个映射表 
    //对应vue源码 src\core\vdom\patch.js  424行

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      //1与2解决数组塌陷时设置节点为null的问题
      //1. 旧开始节点是否存在 不存在下一个
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex]; //2. 旧结束节点是否存在 不存在前一个
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex]; //3. 新老 开始 节点是否相同 是递归patch比较子节点
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        patch(oldStartVnode, newStartVnode);
        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex]; //4. 新老 结束 节点是否相同 是递归patch比较子节点
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        patch(oldEndVnode, newEndVnode);
        oldEndVnode = oldChildren[--oldEndIndex]; // 移动尾部指针

        newEndVnode = newChildren[--newEndIndex]; //5. 老开始 新结束 节点是否相同 是递归patch比较子节点
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        // 正序  和 倒叙  reverst sort
        // 3方案3 头不一样 尾不一样  头移尾  倒序操作
        patch(oldStartVnode, newEndVnode);
        parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 具备移动性

        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex]; //6. 老结束 新开始 节点是否相同 是递归patch比较子节点
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        // 老的尾 和新的头比对
        patch(oldEndVnode, newStartVnode);
        parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else {
        // 乱序比对  最终处理  map映射表起作用了 寻找key值对应的节点比对
        var moveIndex = map[newStartVnode.key];

        if (moveIndex == undefined) {
          // 是一个新元素 在老节点之前插入新节点
          parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        } else {
          // 此时说明两相同节点存在 但是位置不同
          var moveVnode = oldChildren[moveIndex];
          oldChildren[moveIndex] = undefined; // 占位 如果直接删除 可能会导致数组塌陷  [a,b,null,d]
          // 比对当前这两个元素属性和儿子

          patch(moveVnode, newStartVnode);
          parent.insertBefore(moveVnode.el, oldStartVnode.el);
        }

        newStartVnode = newChildren[++newStartIndex]; // 移动新的指针 因为乱序这里只移动新Vnode指针
      }
    } //while之后
    //新 vNode两指针中间还有元素说明中间还需插入节点


    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        // appendChild   =  insertBefore null  js原生操作
        var ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
        parent.insertBefore(createElm(newChildren[i]), ele); // parent.appendChild(createElm(newChildren[i]))
      }
    } //旧 vNode两指针中间还有元素说明是多余的需要删除的节点


    if (oldStartIndex <= oldEndIndex) {
      // 说明新的已经循环完毕了 老的有剩余 剩余就是不要的
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        var child = oldChildren[_i];

        if (child != null) {
          parent.removeChild(child.el);
        }
      }
    } // 没有key 就直接比较类型，如果类型一样就复用 （隐藏的问题是儿子可能都需要重新创建）
    // 循环时尽量采用唯一的标识 作为key 如果用索引（例如倒叙 会采用索引来复用，不够准确）

  }

  function createElm(vnode) {
    // 需要递归创建
    var tag = vnode.tag,
        children = vnode.children,
        data = vnode.data,
        key = vnode.key,
        text = vnode.text;

    if (typeof tag == 'string') {
      // 元素 将虚拟节点和真实节点做一个映射关系 （后面diff时如果元素相同直接复用老元素 ）
      vnode.el = document.createElement(tag);
      updateProperties(vnode); // 跟新元素属性

      children.forEach(function (child) {
        // 递归渲染子节点 将子节点 渲染到父节点中
        vnode.el.appendChild(createElm(child));
      });
    } else {
      // 普通的文本
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function updateProperties(vnode) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // 需要比较 vnode.data 和 oldProps 的差异
    var el = vnode.el;
    var newProps = vnode.data || {}; // 获取老的样式和新的样式的差异 如果新的上面丢失了属性 应该在老的元素上删除掉

    var newStyle = newProps.style || {};
    var oldStyle = oldProps.style || {};

    for (var key in oldStyle) {
      if (!newStyle[key]) {
        el.style[key] = ''; // 删除之前的样式
      }
    }

    for (var _key in oldProps) {
      if (!newProps[_key]) {
        // 此时的元素一是以前
        el.removeAttribute(_key);
      }
    } // 其他情况直接用新的值覆盖掉老的值即可


    for (var _key2 in newProps) {
      if (_key2 == 'style') {
        for (var styleName in newProps.style) {
          // {color:red,background:green}
          el.style[styleName] = newProps.style[styleName];
        } // 浏览器重新渲染也会看值是否变化

      } // event 
      else {
          el.setAttribute(_key2, newProps[_key2]);
        }
    }
  }

  function lifeCycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this; // 将虚拟节点 变成 真实节点 替换掉$el 后续 dom diff 也会执行此方法

      vm.$el = patch(vm.$el, vnode);
    };
  } //钩子函数是用数组存储的所以需要for

  function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers[i].call(vm); //生命周期 this 指向vm实例
      }
    }
  } //当挂载组件时需要用到次方法

  function mountComponent(vm, el) {
    // Vue在渲染的过程中 会创建一个 所谓的“渲染watcher ” 只用来渲染的
    // watcher就是一个回调 每次数据变化 就会重新执行watcher
    // Vue是不是MVVM框架
    callHook(vm, 'beforeMount');

    var updateComponent = function updateComponent() {
      // 内部会调用刚才我们解析后的render方法 =》 vnode
      // _render => options.render 方法
      // _update => 将虚拟dom 变成真实dom 来执行
      console.log('update');

      vm._update(vm._render());
    }; // 每次数据变化 就执行 updateComponent 方法 进行更新操作


    new Watcher(vm, updateComponent, function () {}, true);
    callHook(vm, 'mounted'); // vue 响应式数据的规则 数据变了 视图会刷新
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this; //合并options

      vm.$options = mergeOptions(vm.constructor.options || {}, options);
      callHook(vm, 'beforeCreate');
      initState(vm); //初始化状态

      callHook(vm, 'created'); //在根节点渲染页面

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = vm.$el = document.querySelector(el); //遵循源码 render > template > el 渲染机制

      var opts = vm.$options;

      if (!opts.render) {
        var template = opts.template;

        if (!template && el) {
          template = el.outerHTML;
          console.log(template);
        }

        var render = compileToFunctions(template);
        opts.render = render;
        console.log("render", render);
      } // 走到这用户传入是render函数不需编译 --initMixin初始化结束


      mountComponent(vm); // 组件的挂载流程
    };
  }

  function createTextVNode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
  }
  function createElement(tag) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    //vue 中的 key 不会作为属性传递给组件
    return vnode(tag, data, data.key, children);
  }

  function vnode(tag, data, key, children, text) {
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._v = function (text) {
      //创建文本节点
      return createTextVNode(text);
    };

    Vue.prototype._c = function () {
      //创建标签节点
      return createElement.apply(void 0, arguments);
    };

    Vue.prototype._s = function (val) {
      // 判断当前这个值是不是对象 ，如果是对象 直接转换成字符串 ，防止页面出现[object Object]
      return val == null ? '' : _typeof(val) === 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._render = function () {
      //字符串实现的render方法
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm); //方法存在Vue原型上 this指向Vue _v _c  _s

      return vnode;
    };
  }

  // Vue.directive Vue.filter Vue.component
  function initGlobalAPI(Vue) {
    //全局api
    Vue.options = {}; //公共方法 合并options

    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
    };
  }

  var Vue = function Vue(options) {
    _classCallCheck(this, Vue);

    this._init(options); // 初始化操作

  };

  initMixin(Vue);
  renderMixin(Vue);
  lifeCycleMixin(Vue);
  initGlobalAPI(Vue); // initGlobalApi 给构造函数来扩展全局的方法

  Vue.prototype.$nextTick = nextTick; // ----------------------diff测试----------------------------

  return Vue;

})));
//# sourceMappingURL=vue.js.map
