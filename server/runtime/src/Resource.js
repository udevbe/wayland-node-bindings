'use strict'

const fastcall = require('fastcall')
const ref = fastcall.ref

const wlServerCore = require('./native')

const List = require('./List')
const Client = require('./Client')

class Resource {
  /**
   *
   * @param {List} list
   * @returns {Resource}
   */
  static fromLink (list) {
    const resourcePtr = wlServerCore.interface.wl_resource_from_link(list.ptr)
    const dataPtr = wlServerCore.interface.wl_resource_get_user_data(resourcePtr)
    return dataPtr.readObject(0)
  }

  /**
   *
   * @param {List} list
   * @param {Client} client
   * @return {Resource}
   */
  static findForClient (list, client) {
    const resourcePtr = wlServerCore.interface.wl_resource_find_for_client(list.ptr, client.ptr)
    const dataPtr = wlServerCore.interface.wl_resource_get_user_data(resourcePtr)
    return dataPtr.readObject(0)
  }

  constructor (ptr) {
    this.ptr = ptr
  }

  /**
   *
   * @param {number} opcode
   * @param {Arguments} args
   */
  postEventArray (opcode, args) {
    wlServerCore.interface.wl_resource_post_event_array(this.ptr, opcode, args.ptr)
  }

  /**
   *
   * @param {number} opcode
   * @param {Arguments} args
   */
  queueEventArray (opcode, args) {
    wlServerCore.interface.wl_resource_queue_event_array(this.ptr, opcode, args.ptr)
  }

  /**
   *
   * @param {number} code
   * @param {string} msg
   */
  postError (code, msg) {
    const msgPtr = fastcall.makeStringBuffer(msg)
    wlServerCore.interface.wl_resource_post_error(this.ptr, code, msgPtr)
  }

  postNoMemory () {
    wlServerCore.interface.wl_resource_post_no_memory(this.ptr)
  }

  setDispatcher (dispatcher, implementation, destroy) {
    this._dispatcherPtr = wlServerCore.interface.wl_dispatcher_func_t(dispatcher)
    this._destroyPtr = wlServerCore.interface.wl_resource_destroy_func_t(destroy)
    const implPtr = ref.alloc('Object').writeObject(implementation, 0)
    const dataPtr = ref.alloc('Object').writeObject(this, 0)
    wlServerCore.interface.wl_resource_set_dispatcher(this.ptr, this._dispatcherPtr, implPtr, dataPtr, this._destroyPtr)
  }

  get userData () {
    return wlServerCore.interface.wl_resource_get_user_data(this.ptr)
  }

  destroy () {
    wlServerCore.interface.wl_resource_destroy(this.ptr)
  }

  /**
   * @returns {number}
   */
  get id () {
    return wlServerCore.interface.wl_resource_get_id(this.ptr)
  }

  /**
   * @returns {List}
   */
  get link () {
    const listPtr = wlServerCore.interface.wl_resource_get_link(this.ptr)
    return new List(listPtr)
  }

  /**
   * @returns {Client} client
   */
  get client () {
    const clientPtr = wlServerCore.interface.wl_resource_get_client(this.ptr)
    return new Client(clientPtr)
  }

  /**
   * @returns {number}
   */
  get version () {
    return wlServerCore.interface.wl_resource_get_version(this.ptr)
  }

  set destructor (destroy) {
    wlServerCore.interface.wl_resource_set_destructor(this.ptr, destroy)
  }

  /**
   * @return {string}
   */
  get class () {
    const classPtr = wlServerCore.interface.wl_resource_get_class(this.ptr)
    return ref.readCString(classPtr, 0)
  }

  /**
   *
   * @param {Listener} listener
   */
  addDestroyListener (listener) {
    wlServerCore.interface.wl_resource_add_destroy_listener(this.ptr, listener.ptr)
  }
}

require('./namespace').wl_resource = Resource
module.exports = Resource
