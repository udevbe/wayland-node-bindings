'use strict'

const Resource = require('./Resource')

module.exports = class Dispatcher {
  // void *impl, void *object, uint32 opcode, wl_message *signature, ArgsArray args
  static dispatch (impl, object, opcode, message, argsArray) {
    const implementation = impl.readObject(0)
    const resource = new Resource(object)
    const args = this.unmarshallArgs(resource, message, argsArray)
    implementation[opcode].apply(implementation, args)
    return 0
  }

  static unmarshallArgs (resource, wlMessage, wlArgumentArray) {
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

      const jsArg = this[signatureChar](wlArgument, optional, resource)
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

  static 'o' (wlArg, optional, resource) {
    const client = resource.getClient()
    const objectId = wlArg.deref().o

    if (objectId === 0 && optional) {
      return null
    } else {
      const resourcePtr = client.getObject(objectId)
      const genericResourceArg = new Resource(resourcePtr)
      const data = genericResourceArg.getUserData()
      if (data !== Buffer.NULL_POINTER) {
        // data will hold a more specific js object that extends Resource
        return data.readObject(0)
      } else {
        // If data is null, we're dealing with a C implemented resource that was not created by us. As such no
        // specific js object was created earlier.
        // TODO we could try to construct a proper js resource object based on the argument interface name.
        return genericResourceArg
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
}
