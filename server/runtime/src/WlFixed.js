'use strict'

class WlFixed {
  static create (number) {
    return new WlFixed((number * 256.0) >> 0)
  }

  /**
   * Represent fixed as a signed 24-bit integer.
   *
   * @returns {number}
   */
  asInt () {
    return ((this._raw / 256.0) >> 0)
  }

  /**
   * Represent fixed as a signed 24-bit number with an 8-bit fractional part.
   *
   * @returns {number}
   */
  asDouble () {
    return this._raw / 256.0
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
