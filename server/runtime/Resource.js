'use strict'

const fastcall = require('fastcall')
const ref = fastcall.ref

const wlServerCore = require('./fastcall/wayland-server-core-native')

const List = require('./List')
const Client = require('./Client')

class Resource {
  /**
   *
   * @param {Client}client
   * @param {Interface} interface_
   * @param {number} version
   * @param {number} id
   * @returns {module.Resource}
   */
  static create (client, interface_, version, id) {
    const resourcePtr = wlServerCore.interface.wl_resource_create(client.ptr, interface_.ptr, version, id)
    return new Resource(resourcePtr)
  }

  /**
   *
   * @param {List} list
   * @returns {module.Resource}
   */
  static fromLink (list) {
    const resourcePtr = wlServerCore.interface.wl_resource_from_link(list.ptr)
    return new Resource(resourcePtr)
  }

  /**
   *
   * @param {List} list
   * @param {Client} client
   * @return {module.Resource}
   */
  static findForClient (list, client) {
    const resourcePtr = wlServerCore.interface.wl_resource_find_for_client(list.ptr, client.ptr)
    return new Resource(resourcePtr)
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
    this.implementation = implementation
    const implPtr = ref.alloc('Object').writeObject(implementation, 0)
    const dataPtr = ref.alloc('Object').writeObject(this, 0)
    wlServerCore.interface.wl_resource_set_dispatcher(this.ptr, this._dispatcherPtr, implPtr, dataPtr, destroy)
  }

  getUserData () {
    return wlServerCore.interface.wl_resource_get_user_data(this.ptr)
  }

  destroy () {
    wlServerCore.interface.wl_resource_destroy(this.ptr)
  }

  /**
   * @returns {number}
   */
  getId () {
    return wlServerCore.interface.wl_resource_get_id(this.ptr)
  }

  /**
   * @returns {List}
   */
  getLink () {
    const listPtr = wlServerCore.interface.wl_resource_get_link(this.ptr)
    return new List(listPtr)
  }

  /**
   * @returns {Client} client
   */
  getClient () {
    const clientPtr = wlServerCore.interface.wl_resource_get_client(this.ptr)
    return new Client(clientPtr)
  }

  /**
   * @returns {number}
   */
  getVersion () {
    return wlServerCore.interface.wl_resource_get_version(this.ptr)
  }

  setDestructor (destroy) {
    wlServerCore.interface.wl_resource_set_destructor(this.ptr, destroy)
  }

  /**
   * @return {string}
   */
  getClass () {
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

require('namespace').wl_resource = Resource
module.exports = Resource
