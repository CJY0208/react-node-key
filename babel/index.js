// https://github.com/CJY0208/babel-plugin-tester 开发

const crypto = require('crypto')
const jsxHelpers = require('jsx-ast-utils')
const { isFunction, get } = require('szfe-tools')
const { getKey2Id, callExpressionVisitor } = require('./helpers')

module.exports = function ({ types: t, template, env: getEnv }) {
  // 7.x https://github.com/babel/babel/blob/master/babel.config.js#L4
  // 6.x https://github.com/babel/babel/blob/6.x/packages/babel-core/src/transformation/file/options/build-config-chain.js#L165
  // 尝试从 env 函数或 process 中获取当前 babel 环境
  const env = isFunction(getEnv)
    ? getEnv()
    : process.env.BABEL_ENV || process.env.NODE_ENV || 'development'
  const jSXAttribute = (t.jSXAttribute || t.jsxAttribute).bind(t)
  const jSXIdentifier = (t.jSXIdentifier || t.jsxIdentifier).bind(t)
  const jSXExpressionContainer = (
    t.jSXExpressionContainer || t.jsxExpressionContainer
  ).bind(t)

  function getElementVisitor(filehashIdentifier) {
    const nodeKeyTypeCountMap = new Map()
    // 对每种 NodeType 做编号处理
    const key2Id = getKey2Id()

    function genUUID(node) {
      try {
        const typeId = key2Id(get(node, 'name.name'))

        const count = nodeKeyTypeCountMap.get(typeId) || 0
        const nodeKey = count + 1

        nodeKeyTypeCountMap.set(typeId, nodeKey)

        const nodeId = `${typeId}${nodeKey.toString(32)}`
        const isArrayElement = node.__isArrayElement
        const rawStart = isArrayElement ? 'iAr' : ''

        return jSXExpressionContainer(
          t.templateLiteral(
            [
              t.templateElement({ raw: rawStart, cooked: rawStart }),
              t.templateElement({ raw: nodeId, cooked: nodeId }, true),
            ],
            [filehashIdentifier]
          )
        )
      } catch (error) {
        return t.stringLiteral(`error`)
      }
    }

    return {
      JSXOpeningElement: {
        enter(path) {
          const { node } = path
          // 排除 Fragment
          // TODO: 考虑 Fragment 重命名情况
          if (jsxHelpers.elementType(node).includes('Fragment')) {
            return
          }

          const hasKey = jsxHelpers.hasProp(node.attributes, 'key')
          const nodeKeyIgnore = jsxHelpers.hasProp(
            node.attributes,
            'nodeKeyIgnore'
          )

          const isArrayElement = node.__isArrayElement

          // 不允许自定义 _nk 属性
          // DONE: 使用 key 属性替换，需考虑不覆盖 array 结构中的 key 属性，array 结构中保持 _nk 属性
          // 可参考：https://github.com/yannickcr/eslint-plugin-react/blob/master/lib/rules/jsx-key.js
          const attributes = node.attributes.filter((attr) => {
            try {
              return (
                attr.type !== 'JSXAttribute' ||
                !['nodeKeyIgnore', '_nk'].includes(jsxHelpers.propName(attr))
              )
            } catch (error) {
              return true
            }
          })

          const uuidName = '_nk'

          node.attributes = nodeKeyIgnore
            ? attributes
            : [
                ...attributes,
                jSXAttribute(jSXIdentifier(uuidName), genUUID(node)),
              ]
        },
      },
    }
  }

  return {
    visitor: {
      Program: {
        enter(path, { cwd, filename, file: { opts = {} } = {} }) {
          const md5 = crypto.createHash('md5')
          const filepath =
            filename && filename.replace && cwd
              ? filename.replace(cwd, '')
              : opts.sourceFileName
          md5.update(filepath)
          const hash = md5.digest('base64').slice(0, 4)
          const filehashIdentifier = path.scope.generateUidIdentifier(
            'filehash'
          )

          let filehashTemplate

          try {
            filehashTemplate = template(`const %%filehash%% = %%hashString%%;`)(
              {
                filehash: filehashIdentifier,
                hashString: t.stringLiteral(hash),
              }
            )
          } catch (error) {
            filehashTemplate = template(
              `const ${filehashIdentifier.name} = '${hash}';`
            )()
          }

          const imports = path.node.body.filter((node) =>
            t.isImportDeclaration(node)
          )

          if (imports.length > 0) {
            const insertPlace = imports[imports.length - 1]
            const insertPlacePath = path.get(
              `body.${path.node.body.indexOf(insertPlace)}`
            )
            insertPlacePath.insertAfter(filehashTemplate)
          } else {
            const insertPlacePath = path.get(`body.0`)
            if (insertPlacePath) {
              insertPlacePath.insertBefore(filehashTemplate)
            }
          }
          path.traverse(callExpressionVisitor)
          path.traverse(getElementVisitor(filehashIdentifier))
        },
      },
    },
  }
}
