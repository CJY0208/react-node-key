export function getKey2Id() {
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
