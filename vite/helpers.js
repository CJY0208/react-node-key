const { isExist, get } = require('szfe-tools')

function getKey2Id() {
  let uuid = 0
  const map = new Map()

  // 对每种 NodeType 做编号处理
  return function key2Id(key) {
    let id = map.get(key)

    if (!id) {
      id = (++uuid).toString(32)
      map.set(key, id)
    }

    return id
  }
}

function markIsArrayElement(node) {
  if (node) {
    node.__isArrayElement = true
  }
}

function getReturnStatement(body) {
  return body.filter((item) => item.type === 'ReturnStatement')[0]
}

// 参考 eslint-plugin-react 对数组 key 的校验过程，来标记数组元素
// https://github.com/yannickcr/eslint-plugin-react/blob/master/lib/rules/jsx-key.js#L93
const callExpressionVisitor = {
  // Array.prototype.map
  CallExpression(path) {
    const { node } = path
    if (get(node, 'callee.type') !== 'MemberExpression') {
      return
    }

    if (get(node, 'callee.property.name' !== 'map')) {
      return
    }

    const fn = node.arguments[0]
    const fnType = get(fn, 'type')
    const isFn = fnType === 'FunctionExpression'
    const isArrFn = fnType === 'ArrowFunctionExpression'

    if (isArrFn && ['JSXElement', 'JSXFragment'].includes(fn.body.type)) {
      markIsArrayElement(fn.body.openingElement)
    }

    if (isFn || isArrFn) {
      if (fn.body.type === 'BlockStatement') {
        const returnStatement = getReturnStatement(fn.body.body)
        if (isExist(get(returnStatement, 'argument.openingElement'))) {
          markIsArrayElement(returnStatement.argument.openingElement)
        }
      }
    }
  },
}

module.exports = {
  callExpressionVisitor,
  getKey2Id,
}
