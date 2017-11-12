'use strict'

class WlFixed {
  /**
   * @param {Number}number
   * @return {WlFixed}
   */
  static create (number) {
    if (Number.isInteger(number)) {
      return new WlFixed(number << 8)
    } else {
      // we can't use a fast conversion algorithm as js lacks 64bit integer type :(
      const integerPart = (number >> 0).toString(16) // 32bit integer

      const asHex = number.toString(16)
      const decimalIndex = asHex.indexOf('.')
      const fractalPart = decimalIndex === -1 ? '00' : asHex.substring(decimalIndex + 1, decimalIndex + 3).padEnd(2, '0')

      const rawFixed = (~~parseInt(integerPart + fractalPart, 16)) >> 0 // cast to 32bit int
      return new WlFixed(rawFixed)
    }
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
    const rawHex = this._raw.toString(16)
    const integerPart1 = rawHex.substring(0, rawHex.length - 2)
    const fractalPart1 = rawHex.slice(rawHex.length - 2)

    return parseFloat(~~parseInt(integerPart1, 16).toString(10) + '.' + parseInt(fractalPart1, 16).toString(10))
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
