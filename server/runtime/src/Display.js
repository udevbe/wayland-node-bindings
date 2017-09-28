'use strict'

const fastcall = require('fastcall')
const ref = fastcall.ref

const wlServerCore = require('./native')

const EventLoop = require('./EventLoop')
const Listener = require('./EventLoop')
const List = require('./List')

class Display {
  static create () {
    const ptr = wlServerCore.interface.wl_display_create()
    return new Display(ptr)
  }

  constructor (ptr) {
    this.ptr = ptr
  }

  destroy () {
    wlServerCore.interface.wl_display_destroy(this.ptr)
  }

  get eventLoop () {
    const eventLoopPtr = wlServerCore.interface.wl_display_get_event_loop(this.ptr)
    return new EventLoop(eventLoopPtr)
  }

  /**
   *
   * @param {String} name
   */
  addSocket (name) {
    const namePtr = fastcall.makeStringBuffer(name)
    return wlServerCore.interface.wl_display_add_socket(this.ptr, namePtr)
  }

  /**
   * @returns {String}
   */
  addSocketAuto () {
    const autoNamePtr = wlServerCore.interface.wl_display_add_socket_auto(this.ptr)
    return ref.readCString(autoNamePtr, 0)
  }

  addSocketFd (socketFd) {
    return wlServerCore.interface.wl_display_add_socket_fd(this.ptr, socketFd)
  }

  terminate () {
    wlServerCore.interface.wl_display_terminate(this.ptr)
  }

  run () {
    wlServerCore.interface.wl_display_run(this.ptr)
  }

  flushClients () {
    wlServerCore.interface.wl_display_flush_clients(this.ptr)
  }

  /**
   * @returns {number}
   */
  get serial () {
    return wlServerCore.interface.wl_display_get_serial(this.ptr)
  }

  /**
   * @returns {number}
   */
  nextSerial () {
    return wlServerCore.interface.wl_display_next_serial(this.ptr)
  }

  /**
   *
   * @param {Listener} listener
   */
  addDestroyListener (listener) {
    wlServerCore.interface.wl_display_add_destroy_listener(this.ptr, listener.ptr)
  }

  /**
   *
   * @param {Listener} listener
   */
  addClientCreatedListener (listener) {
    wlServerCore.interface.wl_display_add_client_created_listener(this.ptr, listener.ptr)
  }

  /**
   *
   * @param notify
   * @returns {Listener}
   */
  getDestroyListener (notify) {
    const listenerPtr = wlServerCore.interface.wl_display_get_destroy_listener(this.ptr, notify)
    return new Listener(listenerPtr)
  }

  setGlobalFilter (filter, data) {
    wlServerCore.interface.wl_display_set_global_filter(this.ptr, filter, data)
  }

  /**
   *
   * @returns {List}
   */
  get clientList () {
    const listPtr = wlServerCore.interface.wl_display_get_client_list(this.ptr)
    return new List(listPtr)
  }

  /**
   *
   * @returns {Number}
   */
  initShm () {
    return wlServerCore.interface.wl_display_init_shm(this.ptr)
  }

  /**
   *
   * @param {number}format
   * @returns {Buffer}
   */
  addShmFormat (format) {
    return wlServerCore.interface.wl_display_add_shm_format(this.ptr, format)
  }
}

require('./namespace').wl_display = Display
module.exports = Display
