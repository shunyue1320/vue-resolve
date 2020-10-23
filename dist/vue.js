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
    console.log("el", el);
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
  }

  function generate(el) {
    var children = genChildren(el);
    var attrs = el.attrs.length ? genProps(el.attrs) : undefined;
    var code = "c_(\"".concat(el.tag, "\", ").concat(attrs, " ").concat(children ? ",".concat(children) : '', ")");
    return code;
  }

  function compileToFunctions(template) {
    //1. 将outerHTML 转换成 ast树
    var ast = parseHTML(template); // { tag: 'div', attrs, parent, type, children: [...] }

    console.log("AST:", ast); //2. ast树 => 拼接字符串

    var code = generate(ast); //return _c('div',{id:app,style:{color:red}}, ...children)

    code = "with(this){ \r\n return ".concat(code, " \r\n })");
    console.log("code:", code); //3. 字符串 => 可执行方法

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

  // import Watcher from './observer/watcher';
  // import { patch } from './vdom/patch';
  //钩子函数是用数组存储的所以需要for
  function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers[i].call(vm); //生命周期 this 指向vm实例
      }
    }
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
      } // 走到这用户传入是render函数不需编译


      callHook(vm, 'beforeMount');
    };
  }

  var Vue = function Vue(options) {
    _classCallCheck(this, Vue);

    this._init(options); // 初始化操作

  };

  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
