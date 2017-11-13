'use strict'

class WlFixed {
  /**
   * @param {Number}number
   * @return {WlFixed}
   */
  static create (number) {
    return new WlFixed((number * 256) >> 0)
  }

  /**
   * Represent fixed as a signed 24-bit integer.
   *
   * @returns {number}
   */
  asInt () {
    return this._raw >> 8
  }

  /**
   * Represent fixed as a signed 24-bit number with an 8-bit fractional part.
   *
   * @returns {number}
   */
  asDouble () {
    // we can't use a fast conversion algorithm as js lacks 64bit integer type :(
    return this._raw / 256
  }

  /**
   * use static create instead
   * @private
   * @param raw
   */
  constructor (raw) {
    this._raw = raw
  }
}

require('./namespace').wl_fixed = WlFixed
module.exports = WlFixed
