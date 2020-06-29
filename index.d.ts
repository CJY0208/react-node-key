/// <reference types="react" />
import { Component } from 'react'

export default class NodeKey extends Component<{
  prefix?: string
  onHandleNode?: (node: any, mark?: string) => string | undefined | null
}> {}
