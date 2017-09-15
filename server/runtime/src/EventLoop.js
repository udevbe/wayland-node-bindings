'use strict'

const wlServerCore = require('./native')
const EventSource = require('./EventSource')
const Listener = require('./Listener')

class EventLoop {
  static create () {
    const ptr = wlServerCore.interface.wl_event_loop_create()
    return new EventLoop(ptr)
  }

  constructor (ptr) {
    this.ptr = ptr
  }

  destroy () {
    wlServerCore.interface.wl_event_loop_destroy(this.ptr)
  }

  addFd (fd, mask, func, data) {
    const eventSourcePtr = wlServerCore.interface.wl_event_loop_add_fd(this.ptr, fd, mask, func, data)
    return new EventSource(eventSourcePtr)
  }

  addTimer (func, data) {
    const eventSourcePtr = wlServerCore.interface.wl_event_loop_add_timer(this.ptr, func, data)
    return EventSource(eventSourcePtr)
  }

  addSignal (signalNumber, func, data) {
    const eventSourcePtr = wlServerCore.interface.wl_event_loop_add_signal(this.ptr, signalNumber, func, data)
    return new EventSource(eventSourcePtr)
  }

  dispatch (timeout) {
    return wlServerCore.interface.wl_event_loop_dispatch(this.ptr, timeout)
  }

  dispatchIdle () {
    wlServerCore.interface.wl_event_loop_dispatch_idle(this.ptr)
  }

  addIdle (func, data) {
    const eventSourcePtr = wlServerCore.interface.wl_event_loop_add_idle(this.ptr, func, data)
    return new EventSource(eventSourcePtr)
  }

  get fd () {
    return wlServerCore.interface.wl_event_loop_get_fd(this.ptr)
  }

  addDestroyListener (listener) {
    wlServerCore.interface.wl_event_loop_add_destroy_listener(this.ptr, listener.ptr)
  }

  getDestroyListener (notify) {
    const listenerPtr = wlServerCore.interface.wl_event_loop_get_destroy_listener(this.ptr, notify)
    return new Listener(listenerPtr)
  }
}

require('./namespace').wl_event_loop = EventLoop
module.exports = EventLoop
