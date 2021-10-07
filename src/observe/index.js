import arrayPrototype from "./array";
import Dep from "./dep";

class Observer {
  constructor(data) {
    // 如果是数组的话也是用defineProperty会浪费很多性能 很少用户会通过arr[878] = 123
    // vue3中的polyfill 直接就给数组做代理了
    // 改写数组的方法，如果用户调用了可以改写数组方法的api 那么我就去劫持这个方法
    // 变异方法 push pop shift unshift reverse sort splice

    this.dep = new Dep(); // 给所有的对象都增加一个dep, 后续我们会给对象增添新的属性也期望能实现更新
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false,
    });
    // 如果有__ob__属性 说明被观测过了
    // 修改数组的索引和长度是无法更新视图的
    if (Array.isArray(data)) {
      // 需要重写这7个方法
      data.__proto__ = arrayPrototype;
      // 直接将属性赋值给这个对象
      // 如果数组里面放的是对象类型 我期望他也会被变成响应式的
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }
  observeArray(data) {
    data.forEach((item) => observe(item)); //如果是对象我才进行观测了
  }
  walk(data) {
    // 循环对象 尽量不用for in （会遍历原型链）
    let keys = Object.keys(data); // [0,1,2]
    keys.forEach((key) => {
      //没有重写数组里的每一项
      defineReactive(data, key, data[key]);
    });
  }
}

function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    let temp = value[i];
    temp.__ob__ && temp.__ob__.dep.depend(); // 让数组中的对象类型做依赖收集  [[[]]]
    if (Array.isArray(temp)) {
      dependArray(temp);
    }
  }
}

// 性能不好的原因在于 所有的属性都被重新定义了一遍
// 一上来需要将对象深度代理 性能差
function defineReactive(data, key, value) {
  //  闭包
  // 属性会全部被重写增加了get和set
  let dep = new Dep();
  let childOb = observe(value); // 递归代理属性
  Object.defineProperty(data, key, {
    get() {
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
    set(newValue) {
      // vm.xxx = {a:1} 赋值一个对象的话 也可以实现响应式数据
      if (newValue === value) return;
      childOb = observe(newValue);
      value = newValue;
      dep.notify(); // 通知依赖的watcher去重新渲染
    },
  });
}
export function observe(data) {
  if (typeof data !== "object" || data == null) {
    return; // 如果不是对象类型，那么不要做任何处理
  }
  if (data.__ob__) {
    // 说明这个属性已经被代理过了
    return data;
  }

  // 我稍后要区分 如果一个对象已经被观测了，就不要再次被观测了
  // __ob__ 标识是否有被观测过

  return new Observer(data);
}

// 每个类头有一个prototype 指向了一个公共的空间
// 每个实例可以通过__proto__ 找到所属类的prototype对应的内容

// 1.在Vue2中对象的响应式原理，就是给每个属性增加get和set，而且是递归操作 （用户在写代码的时候尽量不要把所有的属性都放在data中，层次尽可能不要太深）, 赋值一个新对象也会被变成响应式的
// 2.数组没有使用defineProperty 采用的是函数劫持创造一个新的原型重写了这个原型的7个方法，用户在调用的时候采用的是这7个方法。我们增加了逻辑如果是新增的数据会再次被劫持 。 最终调用数组的原有方法 （注意数字的索引和长度没有被监控）  数组中对象类型会被进行响应式处理
