'use strict'

const native = require('./native')
const ShmPool = require('./ShmPool')

module.exports = class Shm {
  static get (buffer) {
    const shmPtr = native.interface.wl_shm_buffer_get(buffer.ptr)
    return new Shm(shmPtr)
  }

  constructor (ptr) {
    this.ptr = ptr
  }

  beginAccess () {
    native.interface.wl_shm_buffer_begin_access(this.ptr)
  }

  endAccess () {
    native.interface.wl_shm_buffer_end_access(this.ptr)
  }

  getData () {
    return native.interface.wl_shm_buffer_get_data(this.ptr)
  }

  getStride () {
    return native.interface.wl_shm_buffer_get_stride(this.ptr)
  }

  getFormat () {
    return native.interface.wl_shm_buffer_get_format(this.ptr)
  }

  getWidth () {
    return native.interface.wl_shm_buffer_get_width(this.ptr)
  }

  getHeight () {
    return native.interface.wl_shm_buffer_get_height(this.ptr)
  }

  refPool () {
    const shmPoolPtr = native.interface.wl_shm_buffer_ref_pool(this.ptr)
    return new ShmPool(shmPoolPtr)
  }
}
