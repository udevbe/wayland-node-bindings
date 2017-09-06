'use strict'

const wlServerCore = require('./fastcall/wayland-server-core-native')

module.exports = class EventSource {
  constructor (ptr) {
    this.ptr = ptr
  }

  /**
   * @param {number
   * @returns {number}
   */
  fdUpdate (mask) {
    return wlServerCore.interface.wl_event_source_fd_update(this.ptr, mask)
  }

  /**
   *
   * @param {number} delay
   * @returns {number}
   */
  timerUpdate (delay) {
    return wlServerCore.interface.wl_event_source_timer_update(this.ptr, delay)
  }

  /**
   * @returns {number}
   */
  remove () {
    return wlServerCore.interface.wl_event_source_remove(this.ptr)
  }

  check () {
    wlServerCore.interface.wl_event_source_check(this.ptr)
  }
}
