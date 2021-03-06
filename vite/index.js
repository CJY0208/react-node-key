// https://github.com/CJY0208/babel-plugin-tester 开发

const crypto = require('crypto')
const jsxHelpers = require('jsx-ast-utils')
const { get } = require('szfe-tools')
const { getKey2Id, callExpressionVisitor } = require('./helpers')
const babel = require('@babel/core');
const cwd = process.cwd();

module.exports = function () {
  const t = babel.types;
  const template = babel.template;
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
    name: 'vite-plugin-react-node-key',
    transform(code, id) {
      // 检查文件后缀
      if (!/(\.js|\.jsx|\.ts|\.tsx)$/i.test(id)) {
        return null;
      }

      const ast = babel.parse(code);
      babel.traverse(ast, {
        Program: {
          enter(path) {
            const filename = id;
            const md5 = crypto.createHash('md5')
            const filepath = filename.replace(cwd, '')
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
        }
      })
    }
  }
}
