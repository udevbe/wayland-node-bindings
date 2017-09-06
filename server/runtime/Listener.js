'use strict'

const wlServerCore = require('./fastcall/wayland-server-core-native')

module.exports = class Listener {
  static create (func) {
    const WlListener = wlServerCore.structs.wl_listener.type
    const struct = new WlListener({
      link: null,
      notify: wlServerCore.interface.wl_notify_func_t(func)
    })
    return new Listener(struct.ref())
  }

  constructor (ptr) {
    this.ptr = ptr
  }
}
