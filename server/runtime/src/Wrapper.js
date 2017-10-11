const native = require('./native')
const fastcall = require('fastcall')
const ref = fastcall.ref
const WlWrapper = native.structs.wl_wrapper.type

class Wrapper {
  static create (destroyFuncPtr, jsObject) {
    const jsObjectPtr = ref.alloc('Object')
    const jsWrapperPtr = ref.alloc('Object')

    jsObjectPtr.writeObject(jsObject, 0)

    const struct = new WlWrapper({
      listener: {
        link: null,
        notify: destroyFuncPtr
      },
      jsobject: jsObjectPtr,
      jswrapper: jsWrapperPtr
    })

    const wrapper = new Wrapper(struct, jsObjectPtr, jsWrapperPtr)
    jsWrapperPtr.writeObject(wrapper, 0)

    this._ref(wrapper)
    return wrapper
  }

  static _ref (wrapper) {
    Wrapper._refs.push(wrapper)
  }

  constructor (struct, jsObjectPtr, jsWrapperPtr) {
    this._struct = struct
    this._jsObjectPtr = jsObjectPtr
    this._jsWrapperPtr = jsWrapperPtr
  }

  get ptr () {
    return this._struct.ref()
  }

  unref () {
    const index = Wrapper._refs.indexOf(this)
    if (index > -1) {
      Wrapper._refs.splice(index, 1)
    }
  }
}

Wrapper._refs = []

require('./namespace').wrapper = Wrapper
module.exports = Wrapper
