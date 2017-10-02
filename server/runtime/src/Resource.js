'use strict'

const fastcall = require('fastcall')
const ref = fastcall.ref

const native = require('./native')

const List = require('./List')
const Client = require('./Client')
const dispatcher = require('./Dispatcher')

class Resource {
  /**
   *
   * @param {List} list
   * @returns {Resource}
   */
  static fromLink (list) {
    const resourcePtr = native.interface.wl_resource_from_link(list.ptr)
    const dataPtr = native.interface.wl_resource_get_user_data(resourcePtr)
    return dataPtr.readObject(0)
  }

  /**
   *
   * @param {List} list
   * @param {Client} client
   * @return {Resource}
   */
  static findForClient (list, client) {
    const resourcePtr = native.interface.wl_resource_find_for_client(list.ptr, client.ptr)
    const dataPtr = native.interface.wl_resource_get_user_data(resourcePtr)
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

  setDispatcher (implementation, destroy) {
    implementation.__destroyPtr = destroy === null ? ref.NULL_POINTER : native.interface.wl_resource_destroy_func_t(destroy)
    implementation.__implPtr = ref.alloc('Object')
    implementation.__implPtr.writeObject(implementation, 0)
    implementation.__dataPtr = ref.alloc('Object')
    implementation.__dataPtr.writeObject(this, 0)
    native.interface.wl_resource_set_dispatcher(this.ptr, dispatcher.ptr, implementation.__implPtr, implementation.__dataPtr, implementation.__destroyPtr)
  }

  get userData () {
    return native.interface.wl_resource_get_user_data(this.ptr)
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
    return new Client(clientPtr)
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

  /**
   * @return {string}
   */
  get class () {
    const classPtr = native.interface.wl_resource_get_class(this.ptr)
    return ref.readCString(classPtr, 0)
  }

  /**
   *
   * @param {Listener} listener
   */
  addDestroyListener (listener) {
    native.interface.wl_resource_add_destroy_listener(this.ptr, listener.ptr)
  }
}

require('./namespace').wl_resource = Resource
module.exports = Resource
