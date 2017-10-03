'use strict'

const util = require('util')

const native = require('./native')
const WlMessage = native.structs.wl_message.type
const WlInterface = native.structs.wl_interface.type
const fastcall = require('fastcall')
const WlArgumentArray = fastcall.ArrayType(native.unions.wl_argument.type)
const PointerArray = fastcall.ArrayType('pointer')

const namespace = require('./namespace')

class Dispatcher {
  constructor () {
    this.ptr = native.interface.wl_dispatcher_func_t((impl, object, opcode, message, wlArgumentArray) => { this.dispatch(impl, object, opcode, message, wlArgumentArray) })
  }

  // void *impl, void *object, uint32 opcode, wl_message *signature, ArgsArray args
  dispatch (impl, object, opcode, message, wlArgumentArray) {
    try {
      const implementation = impl.readObject(0)
      const jsResourcePtr = native.interface.wl_resource_get_user_data(object)
      const jsResource = jsResourcePtr.readObject(0)
      const args = this._unmarshallArgs(jsResource, message, wlArgumentArray)
      implementation[opcode].apply(implementation, args)
      return 0
    } catch (error) {
      console.error(error)
      return -1
    }
  }

  _unmarshallArgs (resource, wlMessage, wlArgumentArray) {
    const jsArgs = [resource]
    wlMessage = wlMessage.reinterpret(24, 0)
    wlMessage.type = WlMessage

    wlArgumentArray = new WlArgumentArray(wlArgumentArray)

    const messageStruct = wlMessage.deref()
    const signature = messageStruct.signature.readCString(0)

    let i = 0
    let len = signature.length
    let argIdx = 0
    let optional = false
    for (; i < len; i++) {
      if (!isNaN(signature[i])) {
        // TODO check if hander supports this version?
        i++
      }

      optional = (signature[i] === '?')
      if (optional) {
        i++
      }

      const signatureChar = signature[i]
      const wlArgument = wlArgumentArray.get(argIdx)
      const typesArray = new PointerArray(messageStruct.types)
      const wlInterface = typesArray.get(argIdx)
      wlInterface.type = WlInterface

      const jsArg = this[signatureChar](wlArgument, optional, resource, wlInterface)
      jsArgs.push(jsArg)

      argIdx++
    }

    return jsArgs
  }

  'i' (wlArg) {
    return wlArg.i
  }

  'u' (wlArg) {
    return wlArg.u
  }

  'f' (wlArg) {
    const fixedRaw = wlArg.f
    return fixedRaw / 256.0
  }

  'h' (wlArg) {
    return wlArg.h
  }

  'o' (wlArg, optional, resource, wlInterface) {
    const resourcePtr = wlArg.o

    // FIXME how to check for null pointer?
    if (resourcePtr === 0 && optional) {
      return null
    } else {
      const jsResourcePtr = native.interface.wl_resource_get_user_data(resourcePtr)
      if (jsResourcePtr !== null) {
        // data will hold the more specific js object that extends Resource
        const jsResource = jsResourcePtr.readObject(0)
        return jsResource
      } else {
        // If data is null, we're dealing with a C implemented resource that was not created by us. As such no
        // specific js object was created earlier. We reconstruct the js object that extends Resource (but without
        // a js requests implementation).
        return this._reconstructResource(resourcePtr, wlInterface)
      }
    }
  }

  'n' (wlArg) {
    return wlArg.n
  }

  's' (wlArg) {
    return wlArg.s.readCString(0)
  }

  'a' (wlArg) {
    return wlArg.a
  }

  _reconstructResource (resourcePtr, wlInterface) {
    wlInterface = wlInterface.deref()
    const itfName = wlInterface.name.readCString(0)
    const itfVersion = wlInterface.version

    if (itfVersion > 1) {
      return new namespace[util.format('%sV%d', itfName, itfVersion)](resourcePtr)
    } else {
      return new namespace[itfName](resourcePtr)
    }
  }
}

module.exports = new Dispatcher()
