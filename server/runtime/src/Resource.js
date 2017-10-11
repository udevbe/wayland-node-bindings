'use strict'

const fastcall = require('fastcall')
const ref = fastcall.ref

const native = require('./native')

const List = require('./List')
const Client = require('./Client')
const Wrapper = require('./Wrapper')
const WlWrapper = native.structs.wl_wrapper.type

class Resource {
  // TODO do the same for event loop
  static getJSObject (resourcePtr) {
    let wlWrapperPtr = native.interface.wl_resource_get_destroy_listener(resourcePtr, Resource._destroyPtr)
    if (wlWrapperPtr.address() === 0) {
      return null
    }
    wlWrapperPtr = wlWrapperPtr.reinterpret(40, 0)
    wlWrapperPtr.type = WlWrapper
    const wlWrapper = wlWrapperPtr.deref()
    return wlWrapper.jsobject.readObject(0)
  }

  /**
   *
   * @param {List} list
   * @returns {Resource}
   */
  static fromLink (list) {
    const resourcePtr = native.interface.wl_resource_from_link(list.ptr)
    return Resource.getJSObject(resourcePtr)
  }

  /**
   *
   * @param {List} list
   * @param {Client} client
   * @return {Resource}
   */
  static findForClient (list, client) {
    const resourcePtr = native.interface.wl_resource_find_for_client(list.ptr, client.ptr)
    return Resource.getJSObject(resourcePtr)
  }

  constructor (ptr) {
    this.ptr = ptr
    this._destroyListeners = []
    this.destroyPromise = new Promise((resolve) => {
      this._destroyResolve = resolve
    })
    this.destroyPromise.then(() => {
      this._destroyListeners.forEach((listener) => {
        listener(this)
      })
    })
  }

  /**
   *
   * @param {number} opcode
   * @param {Arguments} args
   */
  postEventArray (opcode, args) {
    native.interface.wl_resource_post_event_array(this.ptr, opcode, args.ptr)
  }

  /**
   *
   * @param {number} opcode
   * @param {Arguments} args
   */
  queueEventArray (opcode, args) {
    native.interface.wl_resource_queue_event_array(this.ptr, opcode, args.ptr)
  }

  /**
   *
   * @param {number} code
   * @param {string} msg
   */
  postError (code, msg) {
    const msgPtr = fastcall.makeStringBuffer(msg)
    native.interface.wl_resource_post_error(this.ptr, code, msgPtr)
  }

  postNoMemory () {
    native.interface.wl_resource_post_no_memory(this.ptr)
  }

  setDispatcher (implementation) {
    this.implementation = implementation
    const wrapper = Wrapper.create(Resource._destroyPtr, this)
    native.interface.wl_resource_add_destroy_listener(this.ptr, wrapper.ptr)
    native.interface.wl_resource_set_dispatcher(this.ptr, require('./Dispatcher').ptr, ref.NULL_POINTER, ref.NULL_POINTER, ref.NULL_POINTER)
  }

  destroy () {
    native.interface.wl_resource_destroy(this.ptr)
  }

  /**
   * @returns {number}
   */
  get id () {
    return native.interface.wl_resource_get_id(this.ptr)
  }

  /**
   * @returns {List}
   */
  get link () {
    const listPtr = native.interface.wl_resource_get_link(this.ptr)
    return new List(listPtr)
  }

  /**
   * @returns {Client} client
   */
  get client () {
    const clientPtr = native.interface.wl_resource_get_client(this.ptr)
    return Client.getJSObject(clientPtr)
  }

  /**
   * @returns {number}
   */
  get version () {
    return native.interface.wl_resource_get_version(this.ptr)
  }

  set destructor (destroy) {
    native.interface.wl_resource_set_destructor(this.ptr, destroy)
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

  /**
   * @return {string}
   */
  get class () {
    const classPtr = native.interface.wl_resource_get_class(this.ptr)
    return ref.readCString(classPtr, 0)
  }
}

Resource._destroyPtr = native.interface.wl_notify_func_t((listener, data) => {
  listener.type = WlWrapper
  const wlWrapper = listener.deref()
  const resource = wlWrapper.jsobject.readObject(0)
  resource._destroyResolve(resource)
  const wrapper = wlWrapper.jswrapper.readObject(0)
  wrapper.unref()
})

require('./namespace').wl_resource = Resource
module.exports = Resource
