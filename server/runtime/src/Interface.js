'use strict'

const fastcall = require('fastcall')

const native = require('./native')
const WlInterface = native.structs.wl_interface.type

const WlMessageArray = fastcall.ArrayType(native.structs.wl_message.type)

class Interface {
  static create (name, version) {
    const namePtr = fastcall.makeStringBuffer(name)
    return new Interface(new WlInterface(), namePtr, version)
  }

  constructor (struct, namePtr, version) {
    this._struct = struct
    this._namePtr = namePtr
    this._version = version
    this._methods = null
    this._events = null
  }

  get ptr () {
    return this._struct.ref()
  }

  init (methods, events) {
    this._methods = methods
    this._events = events

    this._struct.name = this._namePtr
    this._struct.version = this._version
    this._struct.method_count = this._methods.length
    this._struct.methods = new WlMessageArray(this._methods).buffer
    this._struct.event_count = this._events.length
    this._struct.events = new WlMessageArray(this._events).buffer
  }
}

require('./namespace').wl_interface = Interface
module.exports = Interface
