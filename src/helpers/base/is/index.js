// 值类型判断 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export const isUndefined = val => typeof val === 'undefined'

export const isNull = val => val === null

export const isArray = val => val instanceof Array

export const isObject = val =>
  typeof val === 'object' && !(isArray(val) || isNull(val))

export const isString = val => typeof val === 'string'

export const isNumber = val => typeof val === 'number' && !isNaN(val)

export const isFunction = val => typeof val === 'function'
// 值类型判断 -------------------------------------------------------------
