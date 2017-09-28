'use strict'

const wlServerCore = require('./native')

const Listener = require('./Listener')
const Resource = require('./Resource')
const Display = require('./Display')
const List = require('./List')

class Client {
  /**
   *
   * @param {Display} display
   * @param {number}fd
   */
  static create (display, fd) {
    const clientPtr = wlServerCore.interface.wl_client_create(display.ptr, fd)
    return new Client(clientPtr)
  }

  /**
   *
   * @param {List} list
   */
  static fromLink (list) {
    const clientPtr = wlServerCore.interface.wl_client_from_link(list.ptr)
    return new Client(clientPtr)
  }

  constructor (ptr) {
    this.ptr = ptr
    this.listeners = []
  }

  destroy () {
    wlServerCore.interface.wl_client_destroy(this.ptr)
  }

  /**
   * @returns {List}
   */
  get link () {
    const listPtr = wlServerCore.interface.wl_client_get_link(this.ptr)
    return new List(listPtr)
  }

  flush () {
    wlServerCore.interface.wl_client_flush(this.ptr)
  }

// lib.function('void wl_client_get_credentials(wl_client *client, pid_t *pid, uid_t *uid, gid_t *gid)')

  /**
   *
   * @returns {number}
   */
  get fd () {
    return wlServerCore.interface.wl_client_get_fd(this.ptr)
  }

  /**
   *
   * @param {Listener} listener
   */
  addDestroyListener (listener) {
    // keep ref to avoid gc
    this.listeners.push(listener)
    wlServerCore.interface.wl_client_add_destroy_listener(this.ptr, listener.ptr)
  }

  getDestroyListener (notify) {
    const listenerPtr = wlServerCore.interface.wl_client_get_destroy_listener(this.ptr, notify)
    return new Listener(listenerPtr)
  }

  /**
   *
   * @param {number}id
   */
  getObject (id) {
    const resourcePtr = wlServerCore.interface.wl_client_get_object(this.ptr, id)
    return new Resource(resourcePtr)
  }

  noMemory () {
    wlServerCore.interface.wl_client_post_no_memory(this.ptr)
  }

  addResourceCreatedListener (listener) {
    // keep ref to avoid gc
    this.listeners.push(listener)
    wlServerCore.interface.wl_client_add_resource_created_listener(this.ptr, listener.ptr)
  }

  /**
   * @returns {Display}
   */
  get display () {
    const displayPtr = wlServerCore.interface.wl_client_get_display(this.ptr)
    return new Display(displayPtr)
  }
}

require('./namespace').wl_client = Client
module.exports = Client
