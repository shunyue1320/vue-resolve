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

      var result = (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args));

      ob.dep.notify();
      return result;
    };
  });

  var did = 0; // 收集 watcher

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = did++;
      this.watchers = [];
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // watcher 和 dep 是一个多对多的关系
        Dep.target.addDep(this); // 让 watcher 去记录 dep
      }
    }, {
      key: "addWatcher",
      value: function addWatcher(watcher) {
        this.watchers.push(watcher);
      }
    }, {
      key: "removeWatcher",
      value: function removeWatcher(watcher) {
        if (this.watchers.length) {
          var index = this.watchers.indexOf(watcher);

          if (index > -1) {
            return this.watchers.splice(index, 1);
          }
        }
      }
    }, {
      key: "notify",
      value: function notify() {
        this.watchers.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null; // 描述当前watcher是谁的

  var stack = []; // 存放 updateCompent 与 用户 watch 的 watcher

  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop(); // 删除最后一个项

    Dep.target = stack[stack.length - 1];
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 如果是数组的话也是用defineProperty会浪费很多性能 很少用户会通过arr[878] = 123
      // vue3中的polyfill 直接就给数组做代理了
      // 改写数组的方法，如果用户调用了可以改写数组方法的api 那么我就去劫持这个方法
      // 变异方法 push pop shift unshift reverse sort splice
      this.dep = new Dep(); // 给所有的对象都增加一个dep, 后续我们会给对象增添新的属性也期望能实现更新

      Object.defineProperty(data, "__ob__", {
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
  }();

  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var temp = value[i];
      temp.__ob__ && temp.__ob__.dep.depend(); // 让数组中的对象类型做依赖收集  [[[]]]

      if (Array.isArray(temp)) {
        dependArray(temp);
      }
    }
  } // 性能不好的原因在于 所有的属性都被重新定义了一遍
  // 一上来需要将对象深度代理 性能差


  function defineReactive(data, key, value) {
    //  闭包
    // 属性会全部被重写增加了get和set
    var dep = new Dep();
    var childOb = observe(value); // 递归代理属性

    Object.defineProperty(data, key, {
      get: function get() {
        // vm.xxx
        if (Dep.target) {
          dep.depend(); // 依赖收集 要将属性收集对应的 watcher

          if (childOb) {
            childOb.dep.depend(); // 让数组和对象也记录一下渲染 watcher

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newValue) {
        // vm.xxx = {a:1} 赋值一个对象的话 也可以实现响应式数据
        if (newValue === value) return;
        childOb = observe(newValue);
        value = newValue;
        dep.notify(); // 通知依赖的watcher去重新渲染
      }
    });
  }

  function observe(data) {
    if (_typeof(data) !== "object" || data == null) {
      return; // 如果不是对象类型，那么不要做任何处理
    }

    if (data.__ob__) {
      // 说明这个属性已经被代理过了
      return data;
    } // 我稍后要区分 如果一个对象已经被观测了，就不要再次被观测了
    // __ob__ 标识是否有被观测过


    return new Observer(data);
  } // 每个类头有一个prototype 指向了一个公共的空间
  // 每个实例可以通过__proto__ 找到所属类的prototype对应的内容
  // 1.在Vue2中对象的响应式原理，就是给每个属性增加get和set，而且是递归操作 （用户在写代码的时候尽量不要把所有的属性都放在data中，层次尽可能不要太深）, 赋值一个新对象也会被变成响应式的
  // 2.数组没有使用defineProperty 采用的是函数劫持创造一个新的原型重写了这个原型的7个方法，用户在调用的时候采用的是这7个方法。我们增加了逻辑如果是新增的数据会再次被劫持 。 最终调用数组的原有方法 （注意数字的索引和长度没有被监控）  数组中对象类型会被进行响应式处理

  var callbacks = [];
  var waiting = false;

  function flushCallbacks() {
    waiting = false; // 默认第一次会将两次的nextTick 都维护到callbacks中 [用户的，页面渲染的]

    var cbs = callbacks.slice(0);
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    });
  } // 异步任务分为 两种 宏任务、微任务
  // 宏任务 setTimeout setImmediate(ie下支持性能优于setTimeout)
  // 微任务 promise.then mutationObserver
  // vue在更新的时候希望尽快的更新页面 promise.then  mutationObserver  setImmediate setTimeout
  // vue3不在考虑兼容性问题了 所以后续vue3中直接使用promise.then


  var timeFunc;

  if (typeof Promise !== 'undefined') {
    var p = Promise.resolve();

    timeFunc = function timeFunc() {
      p.then(flushCallbacks);
    };
  } else if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(flushCallbacks); // mutationObserver放的回调是异步执行的

    var textNode = document.createTextNode(1); // 文本节点内容先是 1

    observer.observe(textNode, {
      characterData: true
    });

    timeFunc = function timeFunc() {
      textNode.textContent = 2; // 改成了2  就会触发更新了
    };
  } else if (typeof setImmediate !== 'undefined') {
    timeFunc = function timeFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timeFunc = function timeFunc() {
      setTimeout(flushCallbacks, 0);
    };
  }

  function nextTick(cb) {
    callbacks.push(cb);

    if (!waiting) {
      waiting = true;
      timeFunc();
    }
  }

  var queue = [];
  var has = {};
  var pending = false;

  function flushSchedularQueue() {
    queue.forEach(function (Watcher) {
      return Watcher.run();
    });
    queue = [];
    has = {};
    pending = false;
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (has[id] == null) {
      queue.push(watcher);
      has[id] = true;

      if (!pending) {
        nextTick(function () {
          // 万一一个属性 对应多个更新，那么可能会开启多个定时器
          flushSchedularQueue(); // 批处理操作 ， 防抖
        });
        pending = true;
      }
    }
  }

  var wid = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.exprOrFn = exprOrFn;
      this.cb = cb;
      this.options = options;
      this.deps = [];
      this.depsId = new Set();
      this.id = wid++;
      this.lazy = !!options.lazy; // lazy属性是用来标识默认是否调用函数 (computed)

      this.dirty = this.lazy; // dirty属性是用来做缓存的

      this.user = !!options.user; // 如果是用户watcher会多一个属性 user:true
      // 如果给的是一个字符串， 需要去通过字符串取值

      if (typeof exprOrFn == 'function') {
        this.getter = exprOrFn; // updateComponent
      } else {
        this.getter = function () {
          // user watch 获取监听变量的值
          var path = exprOrFn.split('.');
          return path.reduce(function (vm, current) {
            vm = vm[current]; // 触发getter  执行 dep.depend()  给  dep.watchers 添加一个 watcher 

            return vm;
          }, vm);
        };
      }

      this.value = this.lazy ? undefined : this.get(); // 实现页面的渲染
    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // 为什么要加 pushTarget 与 popTarget 其实就是因为 computed 执行 get 方法时里面来触发了其他响应式变量的get
        // 
        pushTarget(this); // 收集各种 watcher （updateComponent, watch, computed）

        var value = this.getter.call(this.vm); // 去实例中取值  触发getter

        popTarget();
        return value;
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addWatcher(this);
        }
      }
    }, {
      key: "update",
      value: function update() {
        if (this.lazy) {
          // 是计算属性watcher不需要走渲染
          this.dirty = true;
        } else {
          // 渲染用户 watcher
          queueWatcher(this);
        }
      }
    }, {
      key: "run",
      value: function run() {
        // 稍后会触发run方法, 找到对应的回调让回调执行传入新值和老值
        var newValue = this.get(); // 获取最新的状态

        var oldValue = this.value; // 上次保留的老值

        this.value = newValue; // 用新值作为老的值

        if (this.user) {
          // 用户 watch 回调， 参数：(新值， 老值)
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend();
        }
      }
    }, {
      key: "teardown",
      value: function teardown() {
        // 1. 删除这个 watchers
        var _watchers = this.vm._watchers;

        if (_watchers.length) {
          var index = _watchers.indexOf(this);

          if (index > -1) {
            return _watchers.splice(index, 1);
          }
        } // 2. 删除所有 dep 内的这个 watchers


        var i = this.deps.length;

        while (i--) {
          this.deps[i].removeWatcher(this);
        }
      }
    }]);

    return Watcher;
  }(); // watcher 与 dep 多对多关系，一个属性对应多个 watcher, 一个 watcher 对应多个 dep

  function initState(vm) {
    var options = vm.$options; // 数据响应式

    if (options.data) {
      initData(vm);
    } // computed 响应式


    if (options.computed) {
      initComputed(vm);
    } // watcher 监听


    if (options.watch) {
      initWatch(vm);
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
  /********* data 数据响应式 start *********/


  function initData(vm) {
    var data = vm.$options.data; // 如果是函数就拿到函数的返回值 否则就直接采用data作为数据源

    data = vm._data = typeof data === "function" ? data.call(vm) : data; // 属性劫持 采用defineProperty将所有的属性进行劫持
    // 我期望用户可以直接通过 vm.xxx 获取值， 也可以这样取值 vm._data.xxx

    for (var key in data) {
      proxy(vm, "_data", key);
    }

    observe(data);
  }
  /********* data 数据响应式 end *********/

  /********* computed 计算属性 start *********/


  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {}; // 存储所有的 component的 watcher

    for (var key in computed) {
      var userDef = computed[key];
      var getter = typeof userDef === 'function' ? userDef : userDef.get;
      watchers[key] = new Watcher(vm, getter, function () {}, {
        lazy: true
      });
      defineComputed(vm, key);
    }
  }

  function defineComputed(vm, key) {
    Object.defineProperty(vm, key, {
      get: createComputedGetter(key) // 改了重新计算， 没改取缓存

    });
  }

  function createComputedGetter(key) {
    return function () {
      var watcher = this._computedWatchers[key];

      if (watcher.dirty) {
        // 如果dirty:true就重新计算，否则就不算了 把以前的值返回
        watcher.evaluate(); // 会调用用户定义的方法将返回值返回,此时dirty为false，并且用户的返回值存放到了watcher.value上
      } // 在求值的过程中 stack = [渲染watcher，计算属性watcher] Dep.target = 计算属性watcher
      // 当evaluate执行完毕后 stack = [渲染watcher]  Dep.target  = 渲染watcher
      // 计算属性是一个watcher  渲染是一个watcher


      if (Dep.target) {
        // 让计算属性watcher对应的两个dep 记录渲染watcher即可
        watcher.depend();
      }

      return watcher.value;
    };
  }
  /********* computed 计算属性 end *********/

  /********* watch 监听 start *********/


  function initWatch(vm) {
    var watch = vm.$options.watch;

    for (var key in watch) {
      var handler = watch[key]; // 对当前属性进行创建watcher，watcher中存放的回调是handler，取数据是从vm上获取

      createWatcher(vm, key, handler);
    }
  }

  function createWatcher(vm, key, handler) {
    // handler 可以是对象
    var options;

    if (_typeof(handler) === 'object' && handler !== null) {
      options = handler;
      handler = handler.handler;
    } // 你可以判断如果handler 是一个字符串 可以采用实例上的方法


    if (typeof handler === 'string') {
      handler = vm[key];
    }

    return vm.$watch(key, handler, options); // (监听的变量名, 执行发函数, 监听配置)
  }

  function stateMixin(Vue) {
    Vue.prototype.$watch = function (key, handler) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var vm = this;
      options.user = true;
      var watcher = new Watcher(vm, key, handler, options);

      if (options.immediate) {
        handler.call(vm, watcher.value); // watch监听 第一次就触发
      }

      return function unwatchFn() {
        watcher.teardown();
      };
    };
  }
  /********* watch 监听 end *********/

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
    return vnode(vm, undefined, undefined, undefined, undefined, text);
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
    console.log("oldVnode", oldVnode, "vnode", vnode);
    var isRealElement = oldVnode.nodeType;

    if (isRealElement) {
      // 如果有 说明他是一个 dom 元素 (直接挂载 不需要 diff)
      var oldElm = oldVnode; // 需要获取父节点 将当前节点的下一个元素作为参照物 将他插入，之后删除老节点

      var parentNode = oldElm.parentNode;
      var el = createElm(vnode); // 根据虚拟节点

      parentNode.insertBefore(el, oldElm.nextSibling); // nextSibling: 父节点的 childNodes 列表中紧跟在其后面的节点

      parentNode.removeChild(oldElm);
      return el;
    } else {
      // diff算法
      patchVnode(oldVnode, vnode);
      return vnode.el;
    }
  }

  function patchVnode(oldVnode, vnode) {
    // case1: 前后两个虚拟节点不是相同节点直接替换掉即可
    if (!isSameVnode(oldVnode, vnode)) {
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
    } // 标签一样我们就复用节点


    var el = vnode.el = oldVnode.el; // case2：两个元素虚拟节点都是文本的情况下 用新文本换掉老的文本即可

    if (!oldVnode.tag) {
      // 是文本
      if (oldVnode.text !== vnode.text) {
        return el.textContent = vnode.text;
      }
    } // case3: 两个都是标签 比较属性


    updateProperties(vnode, oldVnode.data); // case4: 比较儿子节点

    var oldChildren = oldVnode.children || [];
    var newChildren = vnode.children || []; // (1). 两方都有儿子 

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // diff算法是一层层的比较 不涉及到跨级比较
      updateChildren(el, oldChildren, newChildren);
    } // (2). 一方有儿子 一方没儿子 
    else if (newChildren.length > 0) {
      for (var i = 0; i < newChildren.length; i++) {
        el.appendChild(createElm(newChildren[i]));
      }
    } else if (oldChildren.length > 0) {
      el.innerHTML = ''; // 清空子节点
    }
  } // 是否是同一元素


  function isSameVnode(n1, n2) {
    return n1.tag == n2.tag && n1.key === n2.key;
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
      }); // 样式类名....

      updateProperties(vnode);
    } else {
      // 文本
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  } // 更新节点的 style 与 props

  function updateProperties(vnode) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var newProps = vnode.data || {}; // 老的props 
    // 属性的diff算法

    var el = vnode.el; // 比较sytle 特殊一些 需要看下样式

    var oldStyle = oldProps.style || {};
    var newStyle = newProps.style || {};

    for (var key in oldStyle) {
      if (!(key in newStyle)) {
        el.style[key] = '';
      }
    }

    for (var _key in oldProps) {
      if (!(_key in newProps)) {
        el.removeAttribute(_key);
      }
    }

    for (var _key2 in newProps) {
      if (_key2 === 'style') {
        for (var styleKey in newProps[_key2]) {
          el.style[styleKey] = newProps[_key2][styleKey];
        }
      } else if (_key2 === 'class') {
        el.className = newProps[_key2];
      } else {
        el.setAttribute(_key2, newProps[_key2]);
      }
    }
  } // diff算法采用了双指针的方式进行比对，并且是O(n)


  function updateChildren(el, oldChildren, newChildren) {
    // vue中创建了4个指针 分别指向 老孩子和新孩子的头尾
    // 分别依次进行比较有一方先比较完毕就结束比较
    var oldStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newStartIndex = 0;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newStartVnode = newChildren[0];
    var newEndVnode = newChildren[newEndIndex]; // 有一方比完就停止  儿子的规模变大而变大 O(n)

    function makeIndexByKey(children) {
      return children.reduce(function (memo, current, index) {
        return memo[current.key] = index, memo;
      }, {});
    }

    var map = makeIndexByKey(oldChildren);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // 这里在优化dom的常见操作 向前追加 向后追加  尾部移动头部
      // 复用节点
      if (!oldStartVnode) {
        // [ C1 C2 null C4 C5 ]  (oldStartIndex = null -> C4)
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        // [ C1 C2 C3 C4 unll ]  (oldEndVnode = null -> C4) 
        oldEndVnode = oldChildren[--oldEndIndex];
        /* 
        O1 == N1
        oldChildrens: [O1 O2 O3]
        newChildrens: [N1 N2 N3]
        */
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        // true则: 说明两个元素是同一个元素 要比较属性，和他的儿子
        patchVnode(oldStartVnode, newStartVnode); // 递归比较他们的儿子

        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex]; // O3 == N3
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode);
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
        /* 
        O3 == N1
        oldChildrens: [O1 O2 O3]
        newChildrens: [N1 N2 N3]
          childrenElements: [O1 O2 O3] => [O3 O1 O2] // html节点移动
        */
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        patchVnode(oldEndVnode, newStartVnode);
        el.insertBefore(oldEndVnode.el, oldStartVnode.el); // oldEndVnode 节点移动到 oldStartVnode 前面

        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
        /* 
        O1 == N3
        oldChildrens: [O1 O2 O3]
        newChildrens: [N1 N2 N3]
          childrenElements: [O1 O2 O3] => [O2 O3 O1]
        */
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        patchVnode(oldStartVnode, newEndVnode);
        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // oldStartVnode 节点移动到 oldEndVnode 后面

        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
      } // 会根据key进行diff算法 ， 所以在使用的时候如果列表是可操作的，尽量避开用index作为key
      else {
        // 乱序比对 我们需要尽可能找出能复用的元素出来
        var moveIndex = map[newStartVnode.key];

        if (moveIndex == undefined) {
          // 不用复用直接创建插入即可
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        } else {
          // 有的话直接移动老的节点
          var moveVnode = oldChildren[moveIndex];
          oldChildren[moveIndex] = undefined;
          el.insertBefore(moveVnode.el, oldStartVnode.el);
          patchVnode(moveVnode, newStartVnode); // 比属性 比儿子
        }

        newStartVnode = newChildren[++newStartIndex];
      }
    } // 将新增的直接插入 (newChildren 剩下的 vnode 是需要新增的)


    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var nextEle = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el; // nextEle 可能是一个dom元素 可能是null 是null insertBefore会被变成appendChild

        el.insertBefore(createElm(newChildren[i]), nextEle);
      }
    } // 删除老的多余元素 (oldChildren 剩下的 vnode 是需要删除的)


    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i] !== undefined) {
          el.removeChild(oldChildren[_i].el);
        }
      }
    }
  } // Vue3采用了最长递增子序列，找到最长不需要移动的序列，从而减少了移动操作

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
      var vnode = render.call(vm); // _c( _s _v)  with(this) 【此处获取属性时被 Watcher 监听】

      console.log("vnode =", vnode);
      return vnode;
    };

    Vue.prototype._update = function (vnode) {
      // 将虚拟节点变成真实节点
      // 将 vnode 渲染el元素中
      var vm = this;
      var prevVnode = vm._vnode;

      if (!prevVnode) {
        vm.$el = patch(vm.$el, vnode); // 可以初始化渲染， 后续更新也走这个patch方法
      } else {
        vm.$el = patch(prevVnode, vnode); // 第二次 patch 都传 vnode
      }

      vm._vnode = vnode; // 存储旧 vnode
    };
  }
  function callHook(vm, hook) {
    var handlers = vm.$options[hook];
    handlers && handlers.forEach(function (hook) {
      return hook.call(vm);
    });
  }
  function mountComponent(vm, el) {
    // 实现页面的挂载流程
    vm.$el = el; // 先将 el 挂载到实例上

    callHook(vm, 'beforeMount');

    var updateComponent = function updateComponent() {
      // 需要调用生成的render函数 获取到虚拟节点  -> 生成真实的dom
      vm._update(vm._render());
    }; // 添加监听


    new Watcher(vm, updateComponent, function () {
      console.log('页面重新渲染 updated');
    }, true); // updateComponent(); // 如果稍后数据变化 也调用这个函数重新执行 
    //后续：观察者模式 + 依赖收集 + diff算法
  }

  function initGlobalAPI(Vue) {
    Vue.options = {};

    Vue.mixin = function (options) {
      this.options = mergeOptions(this.options, options);
      return this;
    };
  }
  var LIFECYCLE_HOOKS = ['beforeCreate', 'mounted'];
  var strats = {};
  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = function (parentVal, childVal) {
      if (childVal) {
        if (parentVal) {
          return parentVal.concat(childVal);
        } else {
          return [childVal];
        }
      } else {
        return parentVal;
      }
    };
  }); // 合并两个对象

  function mergeOptions(parent, child) {
    var options = {};

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (!(_key in parent)) {
        mergeField(_key);
      }
    }

    function mergeField(key) {
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        options[key] = child[key] || parent[key];
      }
    }

    return options;
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = mergeOptions(vm.constructor.options, options); // 所有后续的扩展方法都有一个$options选项可以获取用户的所有选项
      // 对于实例的数据源 props data methods computed watch
      // props data

      callHook(vm, 'beforeCreate');
      initState(vm); // vue中会判断如果是$开头的属性不会被变成响应式数据

      callHook(vm, 'created'); // 状态初始化完毕后需要进行页面挂载

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

  stateMixin(Vue);
  lifeCycleMixin(Vue); // 给 Vue 实例添加方法

  initGlobalAPI(Vue); // 合并 options

  Vue.prototype.$nextTick = nextTick;

  return Vue;

}));
//# sourceMappingURL=vue.js.map
