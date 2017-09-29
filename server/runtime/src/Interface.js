'use strict'

const fastcall = require('fastcall')

const wlServerCore = require('./native')
const WlInterface = wlServerCore.structs.wl_interface.type

class Interface {
  static create (name, version, methods, events) {
    const namePtr = fastcall.makeStringBuffer(name)
    return new Interface(new WlInterface({
      name: namePtr,
      version: version,
      method_count: methods.length,
      methods: methods,
      event_count: events.length,
      events: events
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
