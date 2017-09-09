'use strict'

const wlServerCore = require('./fastcall/wayland-server-core-native')
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
    const jsArgs = []
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

  static 'i' (wlArg, optional) {
    return wlArg.deref().i
  }

  static 'u' (wlArg, optional) {
    return wlArg.deref().u
  }

  static 'f' (wlArg, optional) {
    const fixedRaw = wlArg.deref().f
    return fixedRaw / 256.0
  }

  static 'h' (wlArg, optional) {
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
      const data = genericResourceArg.getUserData()
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

  static 'n' (wlArg, optional) {
    return wlArg.deref().n
  }

  static 's' (wlArg, optional) {
    return wlArg.deref().s.readCString(0)
  }

  static 'a' (wlArg, optional) {
    return wlArg.deref().a
  }

  static _reconstructResource (resourcePtr, wlInterface) {
    const interfaceName = wlInterface.name.readCString(0)
    return new namespace[interfaceName](resourcePtr)
  }
}
