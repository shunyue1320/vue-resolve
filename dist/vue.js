(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  // import {initMixin} from './init'
  // function Vue(options){
  //   this._init(options)  // 初始化操作
  // }
  // initMixin(Vue)
  function Vue(options) {
    var a = {
      b: 1111111111
    };
    console.log(a === null || a === void 0 ? void 0 : a.b);
  }

  return Vue;

})));
