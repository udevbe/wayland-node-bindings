'use strict'

const native = require('./native')

const Interface = require('./Interface')

class Global {
  constructor (display, interface_, version, data, bind) {
    this.ptr = native.interface.wl_global_create(display.ptr, interface_.ptr, version, data, bind)
  }

  destroy () {
    native.interface.wl_global_destroy(this.ptr)
  }

  get interface () {
    const interfacePtr = native.interface.wl_global_get_interface(this.ptr)
    return new Interface(interfacePtr)
  }

  get userData () {
    native.interface.wl_global_get_user_data(this.ptr)
  }
}

require('./namespace').wl_global = Global
module.exports = Global
