'use strict'

const native = require('./native')
const WlArrayStruct = native.structs.wl_array.type

class WlArray {
  static create (arrayBuffer) {
    const wlArrayData = Buffer.from(arrayBuffer)
    return new WlArray(new WlArrayStruct({size: arrayBuffer.byteLength, alloc: arrayBuffer.byteLength, data: wlArrayData}))
  }

  constructor (struct) {
    this._struct = struct
  }

  get ptr () {
    return this._struct.ref()
  }
}

require('./namespace').wl_array = WlArray
module.exports = WlArray
