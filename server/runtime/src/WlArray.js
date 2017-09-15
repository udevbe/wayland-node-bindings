'use strict'

const wlServerCore = require('./native')
const WlArrayStruct = wlServerCore.structs.wl_array.type

class WlArray {
  static create (buffer) {
    const arrayPtr = new WlArrayStruct({size: buffer.byteLength, alloc: buffer.byteLength, data: buffer}).ref()
    return new WlArray(arrayPtr)
  }

  constructor (ptr) {
    this.ptr = ptr
  }
}

require('./namespace').wl_array = WlArray
module.exports = WlArray
