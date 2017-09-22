'use strict'

const native = require('./native')
const WlListener = native.structs.wl_listener.type

class Listener {
  static create (func) {
    const struct = new WlListener({
      link: null,
      notify: native.interface.wl_notify_func_t(func)
    })

    const listener = new Listener(struct)
    // keep a reference to prevent gc
    this.refs.push(listener)
    return listener
  }

  constructor (struct) {
    this._struct = struct
  }

  get ptr () {
    return this._struct.ref()
  }

  unref () {
    this.constructor.refs.splice(this.constructor.refs.indexOf(this), 1)
  }
}

Listener.refs = []

require('./namespace').wl_listener = Listener
module.exports = Listener
