'use strict'

const native = require('./native')
const WlWrapper = native.structs.wl_wrapper.type

const EventSource = require('./EventSource')
const Wrapper = require('./Wrapper')

class EventLoop {
  static getJSObject (displayPtr) {
    let wlWrapperPtr = native.interface.wl_event_loop_get_destroy_listener(displayPtr, EventLoop._destroyPtr)
    if (wlWrapperPtr.address() === 0) {
      const eventLoop = new EventLoop(displayPtr)
      const wrapper = Wrapper.create(EventLoop._destroyPtr, eventLoop)
      native.interface.wl_event_loop_add_destroy_listener(eventLoop.ptr, wrapper.ptr)
      return eventLoop
    }
    wlWrapperPtr = wlWrapperPtr.reinterpret(40, 0)
    wlWrapperPtr.type = WlWrapper
    const wlWrapper = wlWrapperPtr.deref()
    return wlWrapper.jsobject.readObject(0)
  }

  static create () {
    const ptr = native.interface.wl_event_loop_create()
    return EventLoop.getJSObject(ptr)
  }

  constructor (ptr) {
    this.ptr = ptr
    this._destroyListeners = []
    this.destroyPromise = new Promise((resolve) => {
      this._destroyResolve = resolve
    })
    this.destroyPromise.then(() => {
      this._destroyListeners.forEach((listener) => {
        listener(this)
      })
    })
  }

  destroy () {
    native.interface.wl_event_loop_destroy(this.ptr)
  }

  addFd (fd, mask, func, data) {
    const eventSourcePtr = native.interface.wl_event_loop_add_fd(this.ptr, fd, mask, func, data)
    return new EventSource(eventSourcePtr)
  }

  addTimer (func, data) {
    const eventSourcePtr = native.interface.wl_event_loop_add_timer(this.ptr, func, data)
    return EventSource(eventSourcePtr)
  }

  addSignal (signalNumber, func, data) {
    const eventSourcePtr = native.interface.wl_event_loop_add_signal(this.ptr, signalNumber, func, data)
    return new EventSource(eventSourcePtr)
  }

  dispatch (timeout) {
    return native.interface.wl_event_loop_dispatch(this.ptr, timeout)
  }

  dispatchIdle () {
    native.interface.wl_event_loop_dispatch_idle(this.ptr)
  }

  addIdle (func, data) {
    const eventSourcePtr = native.interface.wl_event_loop_add_idle(this.ptr, func, data)
    return new EventSource(eventSourcePtr)
  }

  get fd () {
    return native.interface.wl_event_loop_get_fd(this.ptr)
  }

  addDestroyListener (listener) {
    this._destroyListeners.push(listener)
  }

  removeDestroyListener (listener) {
    const index = this._destroyListeners.indexOf(listener)
    if (index > -1) {
      this._destroyListeners.splice(index, 1)
    }
  }

  onDestroy () {
    return this._destroyResolve
  }
}

EventLoop._destroyPtr = native.interface.wl_notify_func_t((listener, data) => {
  listener = listener.reinterpret(40, 0)
  listener.type = WlWrapper
  const wlWrapper = listener.deref()
  const eventLoop = wlWrapper.jsobject.readObject(0)
  eventLoop._destroyResolve(eventLoop)
  const wrapper = wlWrapper.jswrapper.readObject(0)
  wrapper.unref()
})

require('./namespace').wl_event_loop = EventLoop
module.exports = EventLoop
