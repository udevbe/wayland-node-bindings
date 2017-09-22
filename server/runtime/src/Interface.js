'use strict'

const fastcall = require('fastcall')

const wlServerCore = require('./native')
const WlInterface = wlServerCore.structs.wl_interface.type

class Interface {
  static create (name, version, methods, events) {
    return new Interface(new WlInterface({
      name: fastcall.makeStringBuffer(name),
      version: version,
      method_count: methods.length,
      methods: methods,
      event_count: events.length,
      events: events
    }))
  }

  constructor (struct) {
    this._struct = struct
  }

  get ptr () {
    return this._struct.ref()
  }
}

require('./namespace').wl_interface = Interface
module.exports = Interface
