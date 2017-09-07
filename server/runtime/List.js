'use strict'

const wlServerCore = require('./fastcall/wayland-server-core-native')
const WlList = wlServerCore.structs.wl_list.type

module.exports = class List {
  static forEach (head, getMemberFunc, getLinkFunc, doFunc) {
    for (let pos = getMemberFunc(head.next()); getLinkFunc(pos).ptr.address() !== head.ptr.address(); pos = getMemberFunc(getLinkFunc(pos).next())) {
      doFunc(pos)
    }
  }

  static create () {
    const listPtr = new WlList({prev: null, next: null}).ref()
    wlServerCore.interface.functions.wl_list_init(listPtr)
    return new List(listPtr)
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
