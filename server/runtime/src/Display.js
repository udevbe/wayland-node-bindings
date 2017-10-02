'use strict'

const fastcall = require('fastcall')
const ref = fastcall.ref

const native = require('./native')

const EventLoop = require('./EventLoop')
const Listener = require('./EventLoop')
const List = require('./List')

class Display {
  static create () {
    const ptr = native.interface.wl_display_create()
    return new Display(ptr)
  }

  constructor (ptr) {
    this.ptr = ptr
  }

  destroy () {
    native.interface.wl_display_destroy(this.ptr)
  }

  get eventLoop () {
    const eventLoopPtr = native.interface.wl_display_get_event_loop(this.ptr)
    return new EventLoop(eventLoopPtr)
  }

  /**
   *
   * @param {String} name
   */
  addSocket (name) {
    const namePtr = fastcall.makeStringBuffer(name)
    return native.interface.wl_display_add_socket(this.ptr, namePtr)
  }

  /**
   * @returns {String}
   */
  addSocketAuto () {
    const autoNamePtr = native.interface.wl_display_add_socket_auto(this.ptr)
    return ref.readCString(autoNamePtr, 0)
  }

  addSocketFd (socketFd) {
    return native.interface.wl_display_add_socket_fd(this.ptr, socketFd)
  }

  terminate () {
    native.interface.wl_display_terminate(this.ptr)
  }

  run () {
    native.interface.wl_display_run(this.ptr)
  }

  flushClients () {
    native.interface.wl_display_flush_clients(this.ptr)
  }

  /**
   * @returns {number}
   */
  get serial () {
    return native.interface.wl_display_get_serial(this.ptr)
  }

  /**
   * @returns {number}
   */
  nextSerial () {
    return native.interface.wl_display_next_serial(this.ptr)
  }

  /**
   *
   * @param {Listener} listener
   */
  addDestroyListener (listener) {
    native.interface.wl_display_add_destroy_listener(this.ptr, listener.ptr)
  }

  /**
   *
   * @param {Listener} listener
   */
  addClientCreatedListener (listener) {
    native.interface.wl_display_add_client_created_listener(this.ptr, listener.ptr)
  }

  /**
   *
   * @param notify
   * @returns {Listener}
   */
  getDestroyListener (notify) {
    const listenerPtr = native.interface.wl_display_get_destroy_listener(this.ptr, notify)
    return new Listener(listenerPtr)
  }

  setGlobalFilter (filter, data) {
    native.interface.wl_display_set_global_filter(this.ptr, filter, data)
  }

  /**
   *
   * @returns {List}
   */
  get clientList () {
    const listPtr = native.interface.wl_display_get_client_list(this.ptr)
    return new List(listPtr)
  }

  /**
   *
   * @returns {Number}
   */
  initShm () {
    return native.interface.wl_display_init_shm(this.ptr)
  }

  /**
   *
   * @param {number}format
   * @returns {Buffer}
   */
  addShmFormat (format) {
    return native.interface.wl_display_add_shm_format(this.ptr, format)
  }
}

require('./namespace').wl_display = Display
module.exports = Display
