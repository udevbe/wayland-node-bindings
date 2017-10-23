'use strict'

const fastcall = require('fastcall')
const ref = fastcall.ref

const native = require('./native')
const WlWrapper = native.structs.wl_wrapper.type
const WlListener = native.structs.wl_listener.type

const EventLoop = require('./EventLoop')
const List = require('./List')
const Wrapper = require('./Wrapper')
const Client = require('./Client')

class Display {
  static getJSObject (displayPtr) {
    let wlWrapperPtr = native.interface.wl_display_get_destroy_listener(displayPtr, Display._destroyPtr)
    if (wlWrapperPtr.address() === 0) {
      const display = new Display(displayPtr)
      const wrapper = Wrapper.create(Display._destroyPtr, display)
      native.interface.wl_display_add_destroy_listener(display.ptr, wrapper.ptr)
      return display
    }
    wlWrapperPtr = wlWrapperPtr.reinterpret(40, 0)
    wlWrapperPtr.type = WlWrapper
    const wlWrapper = wlWrapperPtr.deref()
    return wlWrapper.jsobject.readObject(0)
  }

  static create () {
    const ptr = native.interface.wl_display_create()
    return Display.getJSObject(ptr)
  }

  constructor (ptr) {
    this.ptr = ptr
    this._destroyListeners = []
    this._destroyPromise = new Promise((resolve) => {
      this._destroyResolve = resolve
    })
    this._destroyPromise.then(() => {
      this._destroyListeners.forEach((listener) => {
        listener(this)
      })
    })
    this._onClientCreatedPtr = native.interface.wl_notify_func_t((listener, data) => { this._onClientCreated(data) })
    this._clientCreatedListener = new WlListener({
      link: null,
      notify: this._onClientCreatedPtr
    })
    native.interface.wl_display_add_client_created_listener(this.ptr, this._clientCreatedListener.ref())
    this._clientCreatedListeners = []
  }

  _onClientCreated (data) {
    const client = Client.getJSObject(data)
    this._clientCreatedListeners.forEach((listener) => { listener(client) })
  }

  removeClientCreatedListener (listener) {
    const index = this._clientCreatedListeners.indexOf(listener)
    if (index > -1) {
      this._clientCreatedListeners.splice(index, 1)
    }
  }

  addClientCreatedListener (listener) {
    this._clientCreatedListeners.push(listener)
  }

  destroy () {
    native.interface.wl_display_destroy(this.ptr)
  }

  get eventLoop () {
    const eventLoopPtr = native.interface.wl_display_get_event_loop(this.ptr)
    return EventLoop.getJSObject(eventLoopPtr)
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

  addDestroyListener (listener) {
    this._destroyListeners.push(listener)
  }

  removeDestroyListener (listener) {
    const index = this._destroyListeners.indexOf(listener)
    if (index > -1) {
      this._destroyListeners.splice(index, 1)
    }
  }

  onDestroy () {
    return this._destroyResolve
  }

  // setGlobalFilter (filter, data) {
  //   native.interface.wl_display_set_global_filter(this.ptr, filter, data)
  // }

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

Display._destroyPtr = native.interface.wl_notify_func_t((listener, data) => {
  listener = listener.reinterpret(40, 0)
  listener.type = WlWrapper
  const wlWrapper = listener.deref()
  const display = wlWrapper.jsobject.readObject(0)
  display._destroyResolve(display)
  const wrapper = wlWrapper.jswrapper.readObject(0)
  wrapper.unref()
})

require('./namespace').wl_display = Display
module.exports = Display
