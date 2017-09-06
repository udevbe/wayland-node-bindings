'use strict'

const wlServerCore = require('./fastcall/wayland-server-core-native')

module.exports = class Global {
  constructor (display, interface_, version, data, bind) {
    this.ptr = wlServerCore.interface.wl_global_create(display.ptr, interface_.ptr, version, data, bind)
  }

  destroy () {
    wlServerCore.interface.wl_global_destroy(this.ptr)
  }

  getInterface () {
    const interfacePtr = wlServerCore.interface.wl_global_get_interface(this.ptr)
  }

  getUserData () {
    wlServerCore.interface.wl_global_get_user_data(this.ptr)
  }
}
