'use strict'

const ref = require('fastcall').ref

const native = require('./native')
const WlListener = native.structs.wl_listener.type

class Listener {
  static create (func) {
    const structPtr = ref.alloc(WlListener)
    structPtr.deref().notify = native.interface.wl_notify_func_t(func)
    // keep a reference to prevent gc
    return new Listener(structPtr)
  }

  constructor (ptr) {
    this.ptr = ptr
  }
}

require('./namespace').wl_listener = Listener
module.exports = Listener
