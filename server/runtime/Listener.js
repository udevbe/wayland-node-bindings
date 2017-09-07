'use strict'

const wlServerCore = require('./fastcall/wayland-server-core-native')
const WlListener = wlServerCore.structs.wl_listener.type

module.exports = class Listener {
  static create (func) {
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
