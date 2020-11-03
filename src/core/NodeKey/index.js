import { Component } from 'react'
import { run } from 'szfe-tools'

import getKeyByFiberNode from './getKeyByFiberNode'
import getKeyByPreactNode from './getKeyByPreactNode'

let type

// 根据 FiberNode 所处位置来确定 nodeKey
export default class NodeKey extends Component {
  static defaultProps = {
    onHandleNode: undefined,
    prefix: '',
  }

  key = null
  genKey = (onHandleNode) => {
    if (!type) {
      // _reactInternals 为 React v17 fiberNode 节点字段
      if (this._reactInternalFiber || this._reactInternals) {
        type = 'React'
      }

      // TODO: May "preact/compat" mode only, not verified yet.
      if (this.__v) {
        type = 'Preact'
      }
    }

    switch (type) {
      case 'Preact': {
        this.key = getKeyByPreactNode(this.__v, onHandleNode)
        break
      }
      case 'React': {
        const fiberNode = this._reactInternalFiber || this._reactInternals
        this.key = getKeyByFiberNode(fiberNode, onHandleNode)
        break
      }
      default: {
        break
      }
    }

    return this.key
  }

  render() {
    const { children, prefix, onHandleNode } = this.props

    return run(
      children,
      undefined,
      `${prefix}${this.key || this.genKey(onHandleNode)}`
    )
  }
}
