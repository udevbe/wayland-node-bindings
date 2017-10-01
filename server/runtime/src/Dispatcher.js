'use strict'

const util = require('util')

const wlServerCore = require('./native')
const WlInterface = wlServerCore.structs.wl_interface.type

const namespace = require('./namespace')
const Resource = require('./Resource')

class Dispatcher {
  constructor () {
    this.ptr = wlServerCore.interface.wl_dispatcher_func_t((impl, object, opcode, message, wlArgumentArray) => { this.dispatch(impl, object, opcode, message, wlArgumentArray) })
  }

  // void *impl, void *object, uint32 opcode, wl_message *signature, ArgsArray args
  dispatch (impl, object, opcode, message, wlArgumentArray) {
    try {
      const implementation = impl.readObject(0)
      const resource = new implementation.__Resource(object)
      const args = this._unmarshallArgs(resource, message, wlArgumentArray)
      implementation[opcode].apply(implementation, args)
      return 0
    } catch (error) {
      console.error(error)
      return -1
    }
  }

  _unmarshallArgs (resource, wlMessage, wlArgumentArray) {
    const jsArgs = [resource]
    const messageStruct = wlMessage.deref()
    const signature = messageStruct.signature.readCString(0)

    let i = 0
    let len = signature.length
    let argIdx = 0
    let optional = false
    for (; i < len; i++) {
      optional = (signature[i] === '?')
      if (optional) {
        i++
      }

      const signatureChar = signature[i]
      const wlArgument = wlArgumentArray.get(argIdx)
      const wlInterface = messageStruct.types.get(argIdx)
      wlInterface.type = WlInterface

      const jsArg = this[signatureChar](wlArgument, optional, resource, wlInterface)
      jsArgs.push(jsArg)

      argIdx++
    }
  }

  'i' (wlArg) {
    return wlArg.deref().i
  }

  'u' (wlArg) {
    return wlArg.deref().u
  }

  'f' (wlArg) {
    const fixedRaw = wlArg.deref().f
    return fixedRaw / 256.0
  }

  'h' (wlArg) {
    return wlArg.deref().h
  }

  'o' (wlArg, optional, resource, wlInterface) {
    const client = resource.getClient()
    const objectId = wlArg.deref().o

    if (objectId === 0 && optional) {
      return null
    } else {
      const resourcePtr = client.getObject(objectId)
      const genericResourceArg = new Resource(resourcePtr)
      const data = genericResourceArg.userData
      if (data !== Buffer.NULL_POINTER) {
        // data will hold the more specific js object that extends Resource
        return data.readObject(0)
      } else {
        // If data is null, we're dealing with a C implemented resource that was not created by us. As such no
        // specific js object was created earlier. We reconstruct the js object that extends Resource (but without
        // a js requests implementation).
        return this._reconstructResource(resourcePtr, wlInterface)
      }
    }
  }

  'n' (wlArg) {
    return wlArg.deref().n
  }

  's' (wlArg) {
    return wlArg.deref().s.readCString(0)
  }

  'a' (wlArg) {
    return wlArg.deref().a
  }

  _reconstructResource (resourcePtr, wlInterface) {
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
