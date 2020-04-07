import { get, isString, getKey2Id } from '../../helpers'

const isArrReg = /^iAr/

// 对每种 NodeType 做编号处理
const key2Id = getKey2Id()

// 获取节点的渲染路径，作为节点的 X 坐标
const genRenderPath = node =>
  node.return ? [node, ...genRenderPath(node.return)] : [node]

// 使用节点 _nk 属性或下标与其 key/index 作为 Y 坐标
const getNodeId = fiberNode => {
  // FIXME: 使用 index 作为 Y 坐标是十分不可靠的行为，待想出更好的法子替代
  const id = get(fiberNode, 'key') || fiberNode.index
  const nodeKey = get(fiberNode, 'pendingProps._nk')
  const isArray = isString(nodeKey) && isArrReg.test(nodeKey)

  return isArray ? `${nodeKey}.${id}` : nodeKey || id
}

// 根据 X,Y 坐标生成 Key
const getKeyByCoord = nodes =>
  nodes
    .map(node => {
      const x = key2Id(get(node, 'type.$$typeof', node.type))
      const y = getNodeId(node)

      return `${x},${y}`
    })
    .join('|')

const getKeyByFiberNode = fiberNode => {
  const key = getKeyByCoord(genRenderPath(fiberNode))

  return key2Id(key)
}

export default getKeyByFiberNode