let oldArrayPrototype = Array.prototype;
// arrayProptotype.__proto__ = Array.prototype;

let arrayPrototype = Object.create(oldArrayPrototype);
let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]
// 重写数组 7 方法 （目的就是对新增的数据再次进行观测 避免里面出现没有监听到的对象数据）
// 如 arr[1000] = 1234 更改数组会响应式是通过 $set 实现的
methods.forEach(method => { // 用户调用push方法会先经历我自己重写的方法,之后调用数组原来的方法
    arrayPrototype[method] = function(...args) {
        let inserted;
        let ob = this.__ob__;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args; // 数组
                break;
            case 'splice': // arr.splice(1,1,xxx)
                inserted = args.slice(2); // 接去掉前两个参数
            default:
                break
        }
        if (inserted) {
            // 对新增的数据再次进行观测
            ob.observeArray(inserted)
        }
        let result = oldArrayPrototype[method].call(this, ...args)
        ob.dep.notify()
        return result
    }
})
export default arrayPrototype

