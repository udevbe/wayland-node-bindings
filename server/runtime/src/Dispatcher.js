'use strict'

const util = require('util')

const wlServerCore = require('./native')
const WlInterface = wlServerCore.structs.wl_interface.type

const namespace = require('./namespace')
const Resource = require('./Resource')

module.exports = class Dispatcher {
  // void *impl, void *object, uint32 opcode, wl_message *signature, ArgsArray args
  static dispatch (impl, object, opcode, message, wlArgumentArray) {
    const implementation = impl.readObject(0)
    const resource = new Resource(object)
    const args = this._unmarshallArgs(resource, message, wlArgumentArray)
    implementation[opcode].apply(implementation, args)
    return 0
  }

  static _unmarshallArgs (resource, wlMessage, wlArgumentArray) {
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

  static 'i' (wlArg) {
    return wlArg.deref().i
  }

  static 'u' (wlArg) {
    return wlArg.deref().u
  }

  static 'f' (wlArg) {
    const fixedRaw = wlArg.deref().f
    return fixedRaw / 256.0
  }

  static 'h' (wlArg) {
    return wlArg.deref().h
  }

  static 'o' (wlArg, optional, resource, wlInterface) {
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

  static 'n' (wlArg) {
    return wlArg.deref().n
  }

  static 's' (wlArg) {
    return wlArg.deref().s.readCString(0)
  }

  static 'a' (wlArg) {
    return wlArg.deref().a
  }

  static _reconstructResource (resourcePtr, wlInterface) {
    const itfName = wlInterface.name.readCString(0)
    const itfVersion = wlInterface.version

    if (itfVersion > 1) {
      return new namespace[util.format('%sV%d', itfName, itfVersion)](resourcePtr)
    } else {
      return new namespace[itfName](resourcePtr)
    }
  }
}
