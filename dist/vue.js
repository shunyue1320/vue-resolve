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
        options.template;
        // 创建render函数 -》 虚拟dom  -》 渲染真实dom
        // const render =  compileToFunction(template); // 开始编译
        // options.render = render;

      } // options.render // 一定存在了

    };
  }

  // 整个自己编写的Vue的入口

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue); // 后续在扩展都可以采用这种方式

  return Vue;

}));
//# sourceMappingURL=vue.js.map
