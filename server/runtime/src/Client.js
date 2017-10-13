'use strict'

const native = require('./native')

const List = require('./List')
const Wrapper = require('./Wrapper')
const WlWrapper = native.structs.wl_wrapper.type

class Client {
  static getJSObject (clientPtr) {
    let wlWrapperPtr = native.interface.wl_client_get_destroy_listener(clientPtr, Client._destroyPtr)
    if (wlWrapperPtr.address() === 0) {
      const client = new Client(clientPtr)
      const wrapper = Wrapper.create(Client._destroyPtr, client)
      native.interface.wl_client_add_destroy_listener(client.ptr, wrapper.ptr)
      return client
    }
    wlWrapperPtr = wlWrapperPtr.reinterpret(40, 0)
    wlWrapperPtr.type = WlWrapper
    const wlWrapper = wlWrapperPtr.deref()
    return wlWrapper.jsobject.readObject(0)
  }

  /**
   *
   * @param {Display} display
   * @param {number}fd
   */
  static create (display, fd) {
    const clientPtr = native.interface.wl_client_create(display.ptr, fd)
    return Client.getJSObject(clientPtr)
  }

  /**
   *
   * @param {List} list
   */
  static fromLink (list) {
    const clientPtr = native.interface.wl_client_from_link(list.ptr)
    return Client.getJSObject(clientPtr)
  }

  /**
   * Don't use directly. Use any of the static methods: Client.getJSObject, Client.create or Client.fromLink
   * @private
   * @param ptr
   */
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
    return this._destroyPromise
  }

  /**
   *
   * @param {number}id
   */
  getObject (id) {
    const resourcePtr = native.interface.wl_client_get_object(this.ptr, id)
    const jsResourcePtr = native.interface.wl_resource_get_user_data(resourcePtr)
    if (jsResourcePtr === null) {
      return null
    }
    return jsResourcePtr.readObject(0)
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
    return require('./Display').getJSObject(displayPtr)
  }
}

Client._destroyPtr = native.interface.wl_notify_func_t((listener, data) => {
  listener = listener.reinterpret(40, 0)
  listener.type = WlWrapper
  const wlWrapper = listener.deref()
  const client = wlWrapper.jsobject.readObject(0)
  client._destroyResolve(client)
  const wrapper = wlWrapper.jswrapper.readObject(0)
  wrapper.unref()
})

require('./namespace').wl_client = Client
module.exports = Client
