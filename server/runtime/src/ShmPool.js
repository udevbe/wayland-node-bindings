'use strict'

const native = require('./native')

module.exports = class ShmPool {
  constructor (ptr) {
    this.ptr = ptr
  }

  unref () {
    native.interface.wl_shm_pool_unref(this.ptr)
  }
}
