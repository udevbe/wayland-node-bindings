'use strict'

const native = require('./native')

const Listener = require('./Listener')
const Display = require('./Display')
const List = require('./List')

class Client {
  /**
   *
   * @param {Display} display
   * @param {number}fd
   */
  static create (display, fd) {
    const clientPtr = native.interface.wl_client_create(display.ptr, fd)
    return new Client(clientPtr)
  }

  /**
   *
   * @param {List} list
   */
  static fromLink (list) {
    const clientPtr = native.interface.wl_client_from_link(list.ptr)
    return new Client(clientPtr)
  }

  constructor (ptr) {
    this.ptr = ptr
  }

  destroy () {
    native.interface.wl_client_destroy(this.ptr)
  }

  /**
   * @returns {List}
   */
  get link () {
    const listPtr = native.interface.wl_client_get_link(this.ptr)
    return new List(listPtr)
  }

  flush () {
    native.interface.wl_client_flush(this.ptr)
  }

  /**
   *
   * @returns {number}
   */
  get fd () {
    return native.interface.wl_client_get_fd(this.ptr)
  }

  /**
   *
   * @param {Listener} listener
   */
  addDestroyListener (listener) {
    native.interface.wl_client_add_destroy_listener(this.ptr, listener.ptr)
  }

  getDestroyListener (notify) {
    const listenerPtr = native.interface.wl_client_get_destroy_listener(this.ptr, notify)
    return new Listener(listenerPtr)
  }

  /**
   *
   * @param {number}id
   */
  getObject (id) {
    const resourcePtr = native.interface.wl_client_get_object(this.ptr, id)
    const impl = native.interface.wl_resource_get_user_data(resourcePtr)
    const implementation = impl.readObject(0)
    const Resource = implementation.__Resource
    return new Resource(resourcePtr)
  }

  noMemory () {
    native.interface.wl_client_post_no_memory(this.ptr)
  }

  addResourceCreatedListener (listener) {
    native.interface.wl_client_add_resource_created_listener(this.ptr, listener.ptr)
  }

  /**
   * @returns {Display}
   */
  get display () {
    const displayPtr = native.interface.wl_client_get_display(this.ptr)
    return new Display(displayPtr)
  }
}

require('./namespace').wl_client = Client
module.exports = Client
