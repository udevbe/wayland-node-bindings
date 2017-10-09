'use strict'

const NULL = require('fastcall').ref.NULL_POINTER

const native = require('./native')
const Interface = require('./Interface')

class Global {
  constructor (display, interface_, version) {
    this._bind_ptr = native.interface.wl_global_bind_func_t((client, data, version, id) => { this.bind(client, version, id) })
    this.ptr = native.interface.wl_global_create(display.ptr, interface_.ptr, version, NULL, this._bind_ptr)
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

  bind (wlClientPtr, version, id) {}
}

require('./namespace').wl_global = Global
module.exports = Global
