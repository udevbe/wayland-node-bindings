const fastcall = require('fastcall')

const wlServerCore = require('./native')
const WlArgument = wlServerCore.unions.wl_argument.type
const WlArray = require('./WlArray')

module.exports = {
  _uintOptional: (arg) => {
    return new WlArgument({u: arg === null ? null : arg})
  },

  _uint: (arg) => {
    return new WlArgument({u: arg})
  },

  _fdOptional: (arg) => {
    return new WlArgument({h: arg === null ? null : arg})
  },

  _fd: (arg) => {
    return new WlArgument({h: arg})
  },

  _intOptional: (arg) => {
    return new WlArgument({i: arg === null ? null : arg})
  },

  _int: (arg) => {
    return new WlArgument({i: arg})
  },

  _fixedOptional: (arg) => {
    return new WlArgument({f: arg === null ? null : arg._raw})
  },

  _fixed: (arg) => {
    return new WlArgument({f: arg._raw})
  },

  _objectOptional: (arg) => {
    return new WlArgument({o: arg === null ? null : arg.ptr})
  },

  _object: (arg) => {
    return new WlArgument({o: arg.ptr})
  },

  _newObject: (arg) => {
    return new WlArgument({n: arg.id})
  },

  _stringOptional: (arg) => {
    return new WlArgument({s: arg === null ? null : fastcall.makeStringBuffer(arg)})
  },

  _string: (arg) => {
    return new WlArgument({s: fastcall.makeStringBuffer(arg)})
  },

  _arrayOptional: (arg) => {
    return new WlArgument({a: arg === null ? null : WlArray.create(arg).ptr})
  },

  _array: (arg) => {
    return new WlArgument({a: WlArray.create(arg).ptr})
  }
}
