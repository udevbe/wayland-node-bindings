'use strict'

const fastcall = require('fastcall')

const wlServerCore = require('./native')
const WlInterface = wlServerCore.structs.wl_interface.type

class Interface {
  static create (name, version, methods, events) {
    const interfacePtr = new WlInterface({
      name: fastcall.makeStringBuffer(name),
      version: version,
      method_count: methods.length,
      methods: methods,
      event_count: events.length,
      events: events
    }).ref()
    return new Interface(interfacePtr)
  }

  constructor (ptr) {
    this.ptr = ptr
  }
}

require('./namespace').wl_interface = Interface
module.exports = Interface
