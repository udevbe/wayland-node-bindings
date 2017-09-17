const fastcall = require('fastcall')

const wlServerCore = require('./native')
const WlArgument = wlServerCore.unions.wl_argument.type
const WlArray = require('./WlArray')

module.exports = {
  _uintOptional: (arg) => {
    return new WlArgument({u: arg === null ? null : arg}).ref()
  },

  _uint: (arg) => {
    return new WlArgument({u: arg}).ref()
  },

  _intOptional: (arg) => {
    return this._uintOptional(arg)
  },

  _int: (arg) => {
    return this._uint(arg)
  },

  _fixedOptional: (arg) => {
    return new WlArgument({f: arg === null ? null : arg._raw}).ref()
  },

  _fixed: (arg) => {
    return new WlArgument({f: arg._raw}).ref()
  },

  _objectOptional: (arg) => {
    return new WlArgument({o: arg === null ? null : arg.ptr}).ref()
  },

  _object: (arg) => {
    return new WlArgument({o: arg}).ref()
  },

  _newObject: (arg) => {
    return new WlArgument({n: arg.id}).ref()
  },

  _stringOptional: (arg) => {
    return new WlArgument({s: arg === null ? null : fastcall.makeStringBuffer(arg)}).ref()
  },

  _string: (arg) => {
    return new WlArgument({s: fastcall.makeStringBuffer(arg)}).ref()
  },

  _arrayOptional: (arg) => {
    return new WlArgument({a: arg === null ? null : WlArray.create(arg).ptr}).ref()
  },

  _array: (arg) => {
    return new WlArgument({a: WlArray.create(arg).ptr}).ref()
  }
}
