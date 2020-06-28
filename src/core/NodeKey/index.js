import { Component } from 'react'

import getKeyByFiberNode from './getKeyByFiberNode'
import getKeyByPreactNode from './getKeyByPreactNode'

const run = require('szfe-tools/lib/run').default

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
      if (this._reactInternalFiber) {
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
        this.key = getKeyByFiberNode(this._reactInternalFiber, onHandleNode)
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
