'use strict'

const wlServerCore = require('./fastcall/wayland-server-core-native')
const WlArrayStruct = wlServerCore.structs.wl_array.type

module.exports = class WlArray {
  static create (buffer) {
    return new WlArrayStruct({size: buffer.byteLength, alloc: buffer.byteLength, data: buffer}).ref()
  }
}
