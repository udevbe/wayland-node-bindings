'use strict'

const native = require('./native')
const WlListener = native.structs.wl_listener.type

class Listener {
  static create (func) {
    const struct = new WlListener({
      link: null,
      notify: native.interface.wl_notify_func_t(func)
    })

    return new Listener(struct)
  }

  constructor (struct) {
    this._struct = struct
  }

  get ptr () {
    return this._struct.ref()
  }
}

require('./namespace').wl_listener = Listener
module.exports = Listener
