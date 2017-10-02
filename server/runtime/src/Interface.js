'use strict'

const fastcall = require('fastcall')

const native = require('./native')
const WlInterface = native.structs.wl_interface.type

const WlMessageArray = fastcall.ArrayType(native.structs.wl_message.type)

class Interface {
  static create (name, version, methods, events) {
    const namePtr = fastcall.makeStringBuffer(name)
    return new Interface(new WlInterface({
      name: namePtr,
      version: version,
      method_count: methods.length,
      methods: new WlMessageArray(methods).buffer,
      event_count: events.length,
      events: new WlMessageArray(events).buffer
    }), namePtr, methods, events)
  }

  constructor (struct, namePtr, methods, events) {
    this._struct = struct
    this._namePtr = namePtr
    this._methods = methods
    this._events = events
  }

  get ptr () {
    return this._struct.ref()
  }
}

require('./namespace').wl_interface = Interface
module.exports = Interface
