import {initMixin} from './init'

class Vue {
  constructor(options) {
    this._init(options); // 初始化操作
  }
}


initMixin(Vue)



export default Vue