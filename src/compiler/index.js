const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 用来描述标签的
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的  捕获的是结束标签的标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的  分组1 拿到的是属性名  , 分组3 ，4， 5 拿到的是key对应的值

const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的    />    >   
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配双花括号中间单的内容

function parserHTML(html) {
  function advance(n) {
    html = html.substring(n) // 每次根据传入的长度截取html
    console.log("html 剩下", html)
  }

  // 树的操作 ，需要根据开始标签和结束标签产生一个树
  let root
  // 如何创建树的父子关系
  let stack = []

  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      attrs,
      children: [],
      parent: null,
      type: 1
    }
  }

  // 开始标签进栈 （先进后出原理）
  function start(tagName, attrs) {
    let element = createASTElement(tagName, attrs)
    if (root == null) {
      root = element
    }
    let parent = stack[stack.length - 1] // 取到栈中的最后一个
    if (parent) {
      element.parent = parent       // 让这个元素记住自己的父亲是谁
      parent.children.push(element) // 让父亲记住儿子是谁
    }
    stack.push(element) //入栈
  }

  // 结束标签出栈
  function end(tagName) {
    stack.pop() //出栈
  }

  // 处理标签内容
  function chars(text) {
    text = text.replace(/\s/g, '')
    if (text) {
      let parent = stack[stack.length - 1]
      parent.children.push({ // 增加一个子元素
        type: 3, // 类型 3 表示文本
        text
      })
    }
  }

  //  ast 描述的是语法本身 ，语法中没有的，不会被描述出来  虚拟dom 是描述真实dom的可以自己增添属性
  while (html) {
    // 1. 处理开始标签 （就是处理 <div id="app">{{name}}</div>  的 <div id="app"> 部分）
    let textEnd = html.indexOf('<')
    if (textEnd === 0) {
      const startTagMatch = parseStartTag(); // 解析开始标签  {tagName:'div',attrs:[{name:"id",value:"app"}]}
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }

      // 3. 处理结束标签 （就是处理 <div id="app">{{name}}</div>  的 </div> 部分）
      let matches
      if (matches = html.match(endTag)) {
        end(matches[1])
        advance(matches[0].length)
        continue
      }
    }

    // 2. 处理标签内容 （就是处理 <div id="app">{{name}}</div> 的 {{name}} 部分）
    let text
    if (textEnd >= 0) {
      text = html.substring(0, textEnd)
    }
    if (text) {
      advance(text.length) // html 删去 text， 处理一点删一点
      chars(text)
    }
  }


  function parseStartTag() {
    const matches = html.match(startTagOpen) // 获取标签头 <div id="app">{{name}}</div> 的 <div 部分
    if (matches) {
      const match = {
        tagName: matches[1],
        attrs: []
      }
      advance(matches[0].length) // 删除html前面匹配到的标签名字符串
      let end, attr
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        // while循环取属性 直到取完
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true })
        advance(attr[0].length) // 取到一个属性删除一个
      }
      if (end) {
        advance(end[0].length)
        return match
      }
    }
  }

  return root
}

// 参数拼接成对象
function genProps(attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').reduce((memo, current) => {
        let [key, value] = current.split(':')
        memo[key] = value
        return memo
      }, obj)
      attr.value = obj // 这里是样式对象 例：{color:red,background:blue}
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0,-1)}}` // 删除最后的 ,
}

function gen(node) {
  if (node.type === 1) {  // 是节点
    return genCode(node)
  } else {
    let text = node.text
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})` // 不带表达式的
    } else {
      let tokens = []
      let match
      // exec 遇到全局匹配会有 lastIndex 问题 每次匹配前需要将lastIndex 置为 0
      let startIndex = defaultTagRE.lastIndex = 0
      while (match = defaultTagRE.exec(text)) {
        let endIndex = match.index // 匹配到索引
        if (endIndex > startIndex) {
          tokens.push(JSON.stringify(text.slice(startIndex, endIndex)))
        }
        tokens.push(`_s(${match[1].trim()})`)
        startIndex = endIndex + match[0].length
      }
      if (startIndex < text.length) { // 最后的尾巴放进去
        tokens.push(JSON.stringify(text.slice(startIndex)))
      }
      return `_v(${tokens.join('+')})` // 最后将动态数据 和非动态的拼接在一起
    }
  }
}

function genChildren(ast) {
  const children = ast.children
  return children.map(child => gen(child)).join(',') // 孩子 , 拼接
}

function genCode(ast) {
  let code
  code = `_c("${ast.tag}", ${
    ast.attrs.length ? genProps(ast.attrs) : 'undefined'
  }${
    ast.children ? (',' + genChildren(ast)) : '' // 后面的参数都是孩子
  })`

  return code
}

export function compileToFunction(template) {
  let ast = parserHTML(template)
  console.log("ast =", ast)

  let code = genCode(ast);
  console.log("code =", code)

  const render = new Function(`with(this){return ${code}}`); // 将字符串变成了函数
  return render
}