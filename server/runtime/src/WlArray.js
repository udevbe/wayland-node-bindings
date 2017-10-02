'use strict'

const native = require('./native')
const WlArrayStruct = native.structs.wl_array.type

class WlArray {
  static create (buffer) {
    return new WlArray(new WlArrayStruct({size: buffer.byteLength, alloc: buffer.byteLength, data: buffer}))
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
