'use strict'

const native = require('./native')
const WlListener = native.structs.wl_listener.type

class Listener {
  static create (func) {
    const funcPtr = native.interface.wl_notify_func_t(func)
    const struct = new WlListener({
      link: null,
      notify: funcPtr
    })

    const listener = new Listener(struct, funcPtr)
    this._ref(listener)
    return listener
  }

  static _ref (listener) {
    Listener._refs.push(listener)
  }

  constructor (struct, funcPtr) {
    this._struct = struct
    this._funcPtr = funcPtr
  }

  get ptr () {
    return this._struct.ref()
  }

  unref () {
    const index = Listener._refs.indexOf(this)
    if (index > -1) {
      Listener._refs.splice(index, 1)
    }
  }
}

Listener._refs = []

require('./namespace').wl_listener = Listener
module.exports = Listener
