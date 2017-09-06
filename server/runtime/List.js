'use strict'

module.exports = class List {
  static create (ptr) {
    return new List(ptr)
  }

  constructor (ptr) {
    this.ptr = ptr
  }
}
