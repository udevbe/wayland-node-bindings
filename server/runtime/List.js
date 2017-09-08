'use strict'

const wlServerCore = require('./fastcall/wayland-server-core-native')

module.exports = class List {
  static * forEach (head, getMember, getLink) {
    for (let pos = getMember(head.next()); getLink(pos).ptr.address() !== head.ptr.address(); pos = getMember(getLink(pos).next())) {
      yield pos
    }
  }

  constructor (ptr) {
    this.ptr = ptr
    this.ptr.type = wlServerCore.structs.wl_list.type
    this.wlList = this.ptr.deref()
  }

  previous () {
    return new List(this.wlList.prev)
  }

  next () {
    return new List(this.wlList.next)
  }
}
