import { isString, isFunction, get, run } from 'szfe-tools'

import { getKey2Id } from '../../helpers'

const isArrReg = /^iAr/

// 对每种 NodeType 做编号处理
const key2Id = getKey2Id()

// 获取节点的渲染路径，作为节点的 X 坐标
const genRenderPath = (node) =>
  node.__ ? [node, ...genRenderPath(node.__)] : [node]

// 使用节点 _nk 属性或下标与其 key/index 作为 Y 坐标
const getNodeId = (node) => {
  // FIXME: Preact 无 index 属性，无 key 与 _nk 之下 Y 坐标不可靠，待修正
  const id = get(node, 'key') || node.index
  const nodeKey = get(node, 'props._nk')
  const isArray = isString(nodeKey) && isArrReg.test(nodeKey)

  return isArray ? `${nodeKey}.${id}` : nodeKey || id
}

const markNode = (node) => {
  const x = key2Id(node.type)
  const y = getNodeId(node)

  return `${x},${y}`
}

// 根据 X,Y 坐标生成 Key
const getKeyByCoord = (nodes, handleNode) =>
  nodes
    .map((node) => {
      const mark = markNode(node)

      return isFunction(handleNode)
        ? run(handleNode, undefined, node, mark)
        : mark
    })
    .filter(Boolean)
    .join('|')

const getKeyByNode = (node, handleNode) => {
  const key = getKeyByCoord(genRenderPath(node), handleNode)

  return key2Id(key)
}

export default getKeyByNode
