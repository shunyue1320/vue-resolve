(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
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

  var oldArrayPrototype = Array.prototype; // arrayProptotype.__proto__ = Array.prototype;

  var arrayPrototype = Object.create(oldArrayPrototype);
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; // 重写数组 7 方法 （目的就是对新增的数据再次进行观测 避免里面出现没有监听到的对象数据）
  // 如 arr[1000] = 1234 更改数组会响应式是通过 $set 实现的

  methods.forEach(function (method) {
    // 用户调用push方法会先经历我自己重写的方法,之后调用数组原来的方法
    arrayPrototype[method] = function () {
      var _oldArrayPrototype$me;

      console.log('数组修改了');
      var inserted;
      var ob = this.__ob__;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args; // 数组

          break;

        case 'splice':
          // arr.splice(1,1,xxx)
          inserted = args.slice(2);
      }

      if (inserted) {
        // 对新增的数据再次进行观测
        ob.observeArray(inserted);
      }

      return (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args));
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 如果是数组的话也是用defineProperty会浪费很多性能 很少用户会通过arr[878] = 123
      // vue3中的polyfill 直接就给数组做代理了
      // 改写数组的方法，如果用户调用了可以改写数组方法的api 那么我就去劫持这个方法
      // 变异方法 push pop shift unshift reverse sort splice 
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      }); // 如果有__ob__属性 说明被观测过了
      // 修改数组的索引和长度是无法更新视图的

      if (Array.isArray(data)) {
        // 需要重写这7个方法
        data.__proto__ = arrayPrototype; // 直接将属性赋值给这个对象
        // 如果数组里面放的是对象类型 我期望他也会被变成响应式的

        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        }); //如果是对象我才进行观测了  
      }
    }, {
      key: "walk",
      value: function walk(data) {
        // 循环对象 尽量不用for in （会遍历原型链）
        var keys = Object.keys(data); // [0,1,2]

        keys.forEach(function (key) {
          //没有重写数组里的每一项
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }(); // 性能不好的原因在于 所有的属性都被重新定义了一遍
  // 一上来需要将对象深度代理 性能差


  function defineReactive(data, key, value) {
    //  闭包
    // 属性会全部被重写增加了get和set
    observe(value); // 递归代理属性

    Object.defineProperty(data, key, {
      get: function get() {
        // vm.xxx
        return value;
      },
      set: function set(newValue) {
        // vm.xxx = {a:1} 赋值一个对象的话 也可以实现响应式数据
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
      }
    });
  }

  function observe(data) {
    if (_typeof(data) !== 'object' || data == null) {
      return; // 如果不是对象类型，那么不要做任何处理
    }

    if (data.__ob__) {
      // 说明这个属性已经被代理过了
      return data;
    } // 我稍后要区分 如果一个对象已经被观测了，就不要再次被观测了
    // __ob__ 标识是否有被观测过


    return new Observer(data);
  }
  // 每个实例可以通过__proto__ 找到所属类的prototype对应的内容
  // 1.在Vue2中对象的响应式原理，就是给每个属性增加get和set，而且是递归操作 （用户在写代码的时候尽量不要把所有的属性都放在data中，层次尽可能不要太深）, 赋值一个新对象也会被变成响应式的
  // 2.数组没有使用defineProperty 采用的是函数劫持创造一个新的原型重写了这个原型的7个方法，用户在调用的时候采用的是这7个方法。我们增加了逻辑如果是新增的数据会再次被劫持 。 最终调用数组的原有方法 （注意数字的索引和长度没有被监控）  数组中对象类型会被进行响应式处理

  function initState(vm) {
    var options = vm.$options; // 后续实现计算属性 、 watcher 、 props 、methods

    if (options.data) {
      initData(vm);
    }
  }

  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; // 如果是函数就拿到函数的返回值 否则就直接采用data作为数据源

    data = vm._data = typeof data === 'function' ? data.call(vm) : data; // 属性劫持 采用defineProperty将所有的属性进行劫持
    // 我期望用户可以直接通过 vm.xxx 获取值， 也可以这样取值 vm._data.xxx

    for (var key in data) {
      proxy(vm, '_data', key);
    }

    observe(data);
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 用来描述标签的

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的  捕获的是结束标签的标签名

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的  分组1 拿到的是属性名  , 分组3 ，4， 5 拿到的是key对应的值

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的    />    >   

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配双花括号中间单的内容

  function parserHTML(html) {
    function advance(n) {
      html = html.substring(n); // 每次根据传入的长度截取html

      console.log("html 剩下", html);
    } // 树的操作 ，需要根据开始标签和结束标签产生一个树


    var root; // 如何创建树的父子关系

    var stack = [];

    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        attrs: attrs,
        children: [],
        parent: null,
        type: 1
      };
    } // 开始标签进栈 （先进后出原理）


    function start(tagName, attrs) {
      var element = createASTElement(tagName, attrs);

      if (root == null) {
        root = element;
      }

      var parent = stack[stack.length - 1]; // 取到栈中的最后一个

      if (parent) {
        element.parent = parent; // 让这个元素记住自己的父亲是谁

        parent.children.push(element); // 让父亲记住儿子是谁
      }

      stack.push(element); //入栈
    } // 结束标签出栈


    function end(tagName) {
      stack.pop(); //出栈
    } // 处理标签内容


    function chars(text) {
      text = text.replace(/\s/g, '');

      if (text) {
        var parent = stack[stack.length - 1];
        parent.children.push({
          // 增加一个子元素
          type: 3,
          // 类型 3 表示文本
          text: text
        });
      }
    } //  ast 描述的是语法本身 ，语法中没有的，不会被描述出来  虚拟dom 是描述真实dom的可以自己增添属性


    while (html) {
      // 1. 处理开始标签 （就是处理 <div id="app">{{name}}</div>  的 <div id="app"> 部分）
      var textEnd = html.indexOf('<');

      if (textEnd === 0) {
        var startTagMatch = parseStartTag(); // 解析开始标签  {tagName:'div',attrs:[{name:"id",value:"app"}]}

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } // 3. 处理结束标签 （就是处理 <div id="app">{{name}}</div>  的 </div> 部分）


        var matches = void 0;

        if (matches = html.match(endTag)) {
          end(matches[1]);
          advance(matches[0].length);
          continue;
        }
      } // 2. 处理标签内容 （就是处理 <div id="app">{{name}}</div> 的 {{name}} 部分）


      var text = void 0;

      if (textEnd >= 0) {
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length); // html 删去 text， 处理一点删一点

        chars(text);
      }
    }

    function parseStartTag() {
      var matches = html.match(startTagOpen); // 获取标签头 <div id="app">{{name}}</div> 的 <div 部分

      if (matches) {
        var match = {
          tagName: matches[1],
          attrs: []
        };
        advance(matches[0].length); // 删除html前面匹配到的标签名字符串

        var _end, attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // while循环取属性 直到取完
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
          advance(attr[0].length); // 取到一个属性删除一个
        }

        if (_end) {
          advance(_end[0].length);
          return match;
        }
      }
    }

    return root;
  } // 参数拼接成对象


  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        var obj = {};
        attr.value.split(';').reduce(function (memo, current) {
          var _current$split = current.split(':'),
              _current$split2 = _slicedToArray(_current$split, 2),
              key = _current$split2[0],
              value = _current$split2[1];

          memo[key] = value;
          return memo;
        }, obj);
        attr.value = obj; // 这里是样式对象 例：{color:red,background:blue}
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}"); // 删除最后的 ,
  }

  function gen(node) {
    if (node.type === 1) {
      // 是节点
      return genCode(node);
    } else {
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")"); // 不带表达式的
      } else {
        var tokens = [];
        var match; // exec 遇到全局匹配会有 lastIndex 问题 每次匹配前需要将lastIndex 置为 0

        var startIndex = defaultTagRE.lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          var endIndex = match.index; // 匹配到索引

          if (endIndex > startIndex) {
            tokens.push(JSON.stringify(text.slice(startIndex, endIndex)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          startIndex = endIndex + match[0].length;
        }

        if (startIndex < text.length) {
          // 最后的尾巴放进去
          tokens.push(JSON.stringify(text.slice(startIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")"); // 最后将动态数据 和非动态的拼接在一起
      }
    }
  }

  function genChildren(ast) {
    var children = ast.children;
    return children.map(function (child) {
      return gen(child);
    }).join(','); // 孩子 , 拼接
  }

  function genCode(ast) {
    var code;
    code = "_c(\"".concat(ast.tag, "\", ").concat(ast.attrs.length ? genProps(ast.attrs) : 'undefined').concat(ast.children ? ',' + genChildren(ast) : '' // 后面的参数都是孩子
    , ")");
    return code;
  }

  function compileToFunction(template) {
    var ast = parserHTML(template);
    console.log("ast =", ast);
    var code = genCode(ast);
    console.log("code =", code);
    var render = new Function("with(this){return ".concat(code, "}")); // 将字符串变成了函数

    return render;
  }

  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, data, children, data.key, null);
  }
  function createTextNode(vm, text) {
    return vnode(vm, null, null, null, null, text);
  }

  function vnode(vm, tag, data, children, key, text) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      children: children,
      key: key,
      text: text // ...

    };
  }

  function patch(oldVnode, vnode) {
    // oldVnode 可能是后续做虚拟节点的时候 是两个虚拟节点的比较
    var isRealElement = oldVnode.nodeType;

    if (isRealElement) {
      // 如果有 说明他是一个 dom 元素
      var oldElm = oldVnode; // 需要获取父节点 将当前节点的下一个元素作为参照物 将他插入，之后删除老节点

      var parentNode = oldElm.parentNode;
      var el = createElm(vnode); // 根据虚拟节点

      parentNode.insertBefore(el, oldElm.nextSibling); // nextSibling: 父节点的 childNodes 列表中紧跟在其后面的节点

      parentNode.removeChild(oldElm);
      return el;
    } // diff算法

  }

  function createElm(vnode) {
    var tag = vnode.tag;
        vnode.data;
        var children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      // 元素
      vnode.el = document.createElement(tag); // 后续我们需要diff算法 拿虚拟节点比对后更新dom

      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child)); // 递归渲染
      });
    } else {
      // 文本
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function lifeCycleMixin(Vue) {
    Vue.prototype._c = function () {
      // 生成 vnode
      return createElement.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._v = function () {
      return createTextNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      // 将数据转化成字符串 因为使用的变量对应的结果可能是一个对象
      if (_typeof(value) === 'object' && value !== null) {
        return JSON.stringify(value);
      }

      return value;
    };

    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm); // _c( _s _v)  with(this)

      console.log("vnode =", vnode);
      return vnode;
    };

    Vue.prototype._update = function (vnode) {
      // 将虚拟节点变成真实节点
      // 将 vnode 渲染el元素中
      var vm = this;
      vm.$el = patch(vm.$el, vnode); // 可以初始化渲染， 后续更新也走这个patch方法
    };
  }
  function mountComponent(vm, el) {
    // 实现页面的挂载流程
    vm.$el = el; // 先将 el 挂载到实例上

    var updateComponent = function updateComponent() {
      // 需要调用生成的render函数 获取到虚拟节点  -> 生成真实的dom
      vm._update(vm._render());
    };

    updateComponent(); // 如果稍后数据变化 也调用这个函数重新执行 
    //后续：观察者模式 + 依赖收集 + diff算法
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // 所有后续的扩展方法都有一个$options选项可以获取用户的所有选项
      // 对于实例的数据源 props data methods computed watch
      // props data

      initState(vm); // vue中会判断如果是$开头的属性不会被变成响应式数据
      // 状态初始化完毕后需要进行页面挂载

      if (vm.$options.el) {
        // el 属性 和直接调用$mount是一样的
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var options = vm.$options;

      if (!options.render) {
        var template = options.template;

        if (!template) {
          // render 和 template 都没有的情况下才获取 outerHTML
          template = el.outerHTML;
        } // 将template变成render函数
        // 创建render函数 -》 虚拟dom  -》 渲染真实dom


        console.log("html 初始值", template);
        var render = compileToFunction(template); // 开始编译

        options.render = render;
      }

      mountComponent(vm, el);
      console.log("render =", options.render.toString());
    };
  }

  // 整个自己编写的Vue的入口

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue); // 后续在扩展都可以采用这种方式

  lifeCycleMixin(Vue); // 给 Vue 实例添加方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
