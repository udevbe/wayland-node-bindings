'use strict'

const wlServerCore = require('./native')

const Interface = require('./Interface')

class Global {
  constructor (display, interface_, version, data, bind) {
    this.ptr = wlServerCore.interface.wl_global_create(display.ptr, interface_.ptr, version, data, bind)
  }

  destroy () {
    wlServerCore.interface.wl_global_destroy(this.ptr)
  }

  get interface () {
    const interfacePtr = wlServerCore.interface.wl_global_get_interface(this.ptr)
    return new Interface(interfacePtr)
  }

  get userData () {
    wlServerCore.interface.wl_global_get_user_data(this.ptr)
  }
}

require('./namespace').wl_global = Global
module.exports = Global
