'use strict'

const native = require('./native')
const Interface = require('./Interface')
const Client = require('./Client')

class Global {
  constructor (display, interface_, version) {
    this._bind_ptr = native.interface.wl_global_bind_func_t((client, data, version, id) => { this._bind(client, version, id) })
    this.ptr = native.interface.wl_global_create(display.ptr, interface_.ptr, version, null, this._bind_ptr)
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

  _bind (wlClientPtr, version, id) {
    this.bind(Client.getJSObject(wlClientPtr), version, id)
  }

  bind (wlClientPtr, version, id) {}
}

require('./namespace').wl_global = Global
module.exports = Global
