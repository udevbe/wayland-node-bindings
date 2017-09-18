#!/usr/bin/env node
'use strict'

// TODO This file shares a lot of code with the client side generator. We could merge both files and allow to client/server
// output based on a runtime flag.

const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
const meow = require('meow')

const wfg = {}

wfg.ProtocolParser = class {
  ['uint'] (argName, optional) {
    return {
      signature: optional ? '?u' : 'u',
      jsType: optional ? '?Number' : 'Number',
      marshallGen: optional ? util.format('namespace._uintOptional(%s)', argName) : util.format('namespace._uint(%s)', argName)
    }
  }

  ['fd'] (argName, optional) {
    return {
      signature: optional ? '?h' : 'h',
      jsType: optional ? '?Number' : 'Number',
      marshallGen: optional ? util.format('namespace._fdOptional(%s)', argName) : util.format('namespace._fd(%s)', argName)
    }
  }

  ['int'] (argName, optional) {
    return {
      signature: optional ? '?i' : 'i',
      jsType: optional ? '?Number' : 'Number',
      marshallGen: optional ? util.format('namespace._intOptional(%s)', argName) : util.format('namespace._int(%s)', argName)
    }
  }

  ['fixed'] (argName, optional) {
    return {
      signature: optional ? '?f' : 'f',
      jsType: optional ? '?Fixed' : 'Fixed',
      marshallGen: optional ? util.format('namespace._fixedOptional(%s)', argName) : util.format('namespace._fixed(%s)', argName)
    }
  }

  ['object'] (argName, optional) {
    return {
      signature: optional ? '?o' : 'o',
      jsType: optional ? '?*' : '*',
      marshallGen: optional ? util.format('namespace._objectOptional(%s)', argName) : util.format('namespace._object(%s)', argName)
    }
  }

  ['new_id'] (argName, optional) {
    return {
      signature: optional ? '?n' : 'n',
      jsType: '*',
      marshallGen: optional ? util.format('namespace._newObjectOptional(%s)', argName) : util.format('namespace._newObject(%s)', argName)
    }
  }

  ['string'] (argName, optional) {
    return {
      signature: optional ? '?s' : 's',
      jsType: optional ? '?string' : 'string',
      marshallGen: optional ? util.format('namespace._stringOptional(%s)', argName) : util.format('namespace._string(%s)', argName)
    }
  }

  ['array'] (argName, optional) {
    return {
      signature: optional ? '?a' : 'a',
      jsType: optional ? '?ArrayBuffer' : 'ArrayBuffer',
      marshallGen: optional ? util.format('namespace._arrayOptional(%s)', argName) : util.format('namespace._array(%s)', argName)
    }
  }

  static _generateEventArgs (requires, body, req) {
    if (req.hasOwnProperty('arg')) {
      const evArgs = req.arg
      let processedFirstArg = false
      for (let i = 0; i < evArgs.length; i++) {
        const arg = evArgs[i]

        const argName = arg.$.name
        if (processedFirstArg) {
          body.push(', ')
        }
        body.push(argName)
        processedFirstArg = true
      }
    }
  }

  static _generateRequestArgs (reqRequires, reqBody, ev) {
    reqBody.push('resource')
    if (ev.hasOwnProperty('arg')) {
      const evArgs = ev.arg
      for (let i = 0; i < evArgs.length; i++) {
        reqBody.push(', ')
        const arg = evArgs[i]
        const argName = arg.$.name
        reqBody.push(argName)
      }
    }
  }

  _parseItfRequest (reqRequires, reqBody, className, itfRequest) {
    const sinceVersion = itfRequest.$.hasOwnProperty('since') ? parseInt(itfRequest.$.since) : 1
    const reqName = itfRequest.$.name

    // function docs
    if (itfRequest.hasOwnProperty('description')) {
      const description = itfRequest.description
      description.forEach((val) => {
        reqBody.push('  /**\n')
        if (val.hasOwnProperty('_')) {
          val._.split('\n').forEach((line) => {
            reqBody.push('   *' + line + '\n')
          })
        }

        reqBody.push('   *\n')
        reqBody.push(util.format('   * @param {%s} resource\n', className))
        if (itfRequest.hasOwnProperty('arg')) {
          const evArgs = itfRequest.arg
          evArgs.forEach((arg) => {
            const argDescription = arg.$.summary
            const argName = arg.$.name
            const optional = arg.$.hasOwnProperty('allow-null') && (arg.$['allow-null'] === 'true')
            const argType = arg.$.type

            if (argType === 'object') {
              reqRequires.push(util.format('require(\'%s\')\n', arg.$.interface))
            }

            reqBody.push(util.format('   * @param {%s} %s %s\n', this[argType](argName, optional).jsType, argName, argDescription))
          })
        }
        reqBody.push('   *\n')
        reqBody.push(util.format('   * @since %d\n', sinceVersion))
        reqBody.push('   *\n')
        reqBody.push('   */\n')
      })
    }

    // function
    reqBody.push(util.format('  %s (', reqName))
    wfg.ProtocolParser._generateRequestArgs(reqRequires, reqBody, itfRequest)
    reqBody.push(') {}\n')
  }

  _signature (message) {
    let signature = ''
    if (message.hasOwnProperty('arg')) {
      const args = message.arg
      args.forEach((arg) => {
        const argName = arg.$.name
        const optional = arg.$.hasOwnProperty('allow-null') && (arg.$['allow-null'] === 'true')
        const argType = arg.$.type
        let argSignature = this[argType](argName, optional).signature
        if (argSignature === 'n' && arg.$.interface === 'undefined') {
          argSignature = 'sun'
        }
        signature += argSignature
      })
    }

    return signature
  }

  _parseMessageTypes (requires, body, message) {
    if (message.hasOwnProperty('arg')) {
      const args = message.arg
      let firstArg = true
      args.forEach((arg) => {
        if (!firstArg) {
          body.push(',\n')
        }
        firstArg = false
        const argType = arg.$.type
        if (argType === 'object' && arg.$.hasOwnProperty('interface')) {
          const argItfName = arg.$.interface
          requires.push(util.format('const %s = require(\'%s\')\n', argItfName, argItfName))
          body.push(util.format('      %s.interface.ptr', argItfName))
        } else {
          body.push('      null')
        }
      })
    }
  }

  _parseItfReqDef (requires, body, itfRequest, opcode, itfVersion, sinceVersion) {
    const eventName = itfRequest.$.name

    body.push('  new WlMessage({\n')
    body.push(util.format('    name: \'%s\',\n', eventName))
    body.push(util.format('    signature: \'%d%s\',\n', sinceVersion, this._signature(itfRequest)))
    body.push('    types: [\n')
    this._parseMessageTypes(requires, body, itfRequest)
    body.push('\n    ]\n')
    body.push('  })')
  }

  _parseItfEventDef (requires, body, itfEvent, opcode, itfVersion, sinceVersion) {
    const eventName = itfEvent.$.name

    body.push('  new WlMessage({\n')
    body.push(util.format('    name: \'%s\',\n', eventName))
    body.push(util.format('    signature: \'%d%s\',\n', sinceVersion, this._signature(itfEvent)))
    body.push('    types: [\n')
    this._parseMessageTypes(requires, body, itfEvent)
    body.push('\n    ]\n')
    body.push('  })')
  }

  _parseItfEvent (requires, body, itfEvent, opcode, itfVersion) {
    const sinceVersion = itfEvent.$.hasOwnProperty('since') ? parseInt(itfEvent.$.since) : 1
    if (sinceVersion !== itfVersion) {
      return
    }

    const eventName = itfEvent.$.name

    // function docs
    if (itfEvent.hasOwnProperty('description')) {
      const description = itfEvent.description
      description.forEach((val) => {
        body.push('\n  /**\n')
        if (val.hasOwnProperty('_')) {
          val._.split('\n').forEach((line) => {
            body.push('   *' + line + '\n')
          })
        }

        if (itfEvent.hasOwnProperty('arg')) {
          const eventArgs = itfEvent.arg
          body.push('   *\n')
          eventArgs.forEach((arg) => {
            const argDescription = arg.$.summary
            const argName = arg.$.name
            const optional = arg.$.hasOwnProperty('allow-null') && (arg.$['allow-null'] === 'true')
            const argType = arg.$.type
            body.push(util.format('   * @param {%s} %s %s\n', this[argType](argName, optional).jsType, argName, argDescription))
          })
          body.push('   *\n')
        }
        body.push(util.format('   * @since %d\n', sinceVersion))
        body.push('   *\n')
        body.push('   */\n')
      })
    }

    // function
    body.push(util.format('  %s (', eventName))
    wfg.ProtocolParser._generateEventArgs(requires, body, itfEvent)
    body.push(') {\n')

    // function args
    let argArray = '['
    if (itfEvent.hasOwnProperty('arg')) {
      const reqArgs = itfEvent.arg

      for (let i = 0; i < reqArgs.length; i++) {
        const arg = reqArgs[i]
        const argType = arg.$.type
        const argName = arg.$.name
        const optional = arg.$.hasOwnProperty('allow-null') && (arg.$['allow-null'] === 'true')

        if (i !== 0) {
          argArray += ', '
        }

        argArray += this[argType](argName, optional).marshallGen
      }
    }
    argArray += ']'

    body.push(util.format('    native.interface.wl_resource_post_event_array(this.ptr, %d, %s)\n', opcode, argArray))
    body.push('  }\n')
  }

  _parseInterface (protocolItf, copyright, outDir) {
    const copyrights = []

    // copyright
    copyrights.push('/*\n')
    copyright.forEach((val) => {
      val.split('\n').forEach((line) => {
        copyrights.push(' *' + line + '\n')
      })
    })
    copyrights.push(' */\n')

    const itfName = protocolItf.$.name
    let itfVersion = 1

    if (protocolItf.$.hasOwnProperty('version')) {
      itfVersion = parseInt(protocolItf.$.version)
    }

    console.log(util.format('Processing interface %s v%d', itfName, itfVersion))

    // enums
    if (protocolItf.hasOwnProperty('enum')) {
      // create new files to define enums
      const itfEnums = protocolItf.enum
      for (let j = 0; j < itfEnums.length; j++) {
        const itfEnum = itfEnums[j]
        const enumName = itfEnum.$.name

        let out
        if (outDir === undefined) {
          out = fs.createWriteStream(util.format('%s_%s.js', itfName, enumName))
        } else {
          out = fs.createWriteStream(util.format('%s/%s_%s.js', outDir, itfName, enumName))
        }

        out.on('open', (fd) => {
          out.write('const namespace = require(\'wayland-server-bindings\').namespace\n\n')
          out.write(util.format('const %s_%s = {\n', itfName, enumName))

          let firstArg = true
          itfEnum.entry.forEach((entry) => {
            const entryName = entry.$.name
            const entryValue = entry.$.value
            const entrySummary = entry.$.summary

            if (!firstArg) {
              out.write(',\n')
            }
            firstArg = false

            out.write('  /**\n')
            out.write(util.format('   * %s\n', entrySummary))
            out.write('   */\n')
            out.write(util.format('  %s: %s', entryName, entryValue))
          })
          out.write('\n}\n\n')
          out.write(util.format('namespace.%s_%s = %s_%s\n', itfName, enumName, itfName, enumName))
          out.write(util.format('module.exports = %s_%s\n', itfName, enumName))
        })
      }
    }

    // request itf
    if (protocolItf.hasOwnProperty('request')) {
      // create new file to define requests
      let out
      if (outDir === undefined) {
        out = fs.createWriteStream(util.format('%s_requests.js', itfName))
      } else {
        out = fs.createWriteStream(util.format('%s/%s_requests.js', outDir, itfName))
      }
      out.on('open', (fd) => {
        const reqRequires = []
        const reqBody = []

        reqBody.push(util.format('class %s {\n', itfName))

        const itfRequests = protocolItf.request

        // constructor
        reqBody.push('  constructor () {\n')
        for (let j = 0; j < itfRequests.length; j++) {
          const itfRequest = itfRequests[j]
          const reqName = itfRequest.$.name
          reqBody.push(util.format('    this[%d] = this.%s\n', j, reqName))
        }
        reqBody.push('  }\n\n')

        // functions
        for (let j = 0; j < itfRequests.length; j++) {
          const itfRequest = itfRequests[j]
          this._parseItfRequest(reqRequires, reqBody, itfName, itfRequest)
        }

        reqBody.push('}\n\n')
        reqBody.push(util.format('module.exports = %s\n', itfName))

        copyrights.forEach((line) => {
          out.write(line)
        })
        out.write('\n')
        reqRequires.filter(function (item, pos, self) {
          return self.indexOf(item) === pos
        }).forEach((line) => {
          out.write(line)
        })
        out.write('\n')
        reqBody.forEach((line) => {
          out.write(line)
        })
      })
    }

    for (let i = 1; i <= itfVersion; i++) {
      const body = []
      const requires = []
      requires.push('const wsb = require(\'wayland-server-bindings\')\n')
      requires.push('const namespace = wsb.namespace\n')
      requires.push('const native = wsb.native\n')
      requires.push('const Dispatcher = wsb.Dispatcher\n')
      requires.push('const Resource = wsb.Resource\n')
      requires.push('const Interface = wsb.Interface\n')
      requires.push('const WlMessage = wsb.WlMessage\n')

      // class docs
      const description = protocolItf.description
      if (description) {
        description.forEach((val) => {
          body.push('/**\n')
          if (val.hasOwnProperty('_')) {
            val._.split('\n').forEach((line) => {
              body.push(' *' + line + '\n')
            })
          }
          body.push(' */\n')
        })
      }

      // class
      let className = itfName
      if (i === 1) {
        body.push(util.format('class %s extends Resource {\n', className))
      } else {
        className = util.format('%sV%d', itfName, i)
        let extension
        if (i === 2) {
          extension = itfName
        } else {
          extension = util.format('%sV%d', itfName, i - 1)
        }
        body.push(util.format('class %s extends %s {\n', className, extension))
        requires.push(util.format('const %s = require(\'%s\')\n', extension, extension))
      }

      // create
      body.push('  static create (client, version, id, implementation, destroyFunc) {\n')
      body.push('    const resourcePtr = native.interface.wl_resource_create(client.ptr, this.interface_.ptr, version, id)\n')
      body.push(util.format('    const resource = new %s(resourcePtr)\n', className))
      body.push('    resource.setDispatcher(Dispatcher.dispatch, implementation, destroyFunc)\n')
      body.push('    return resource\n')
      body.push('  }\n')

      // constructor
      body.push('\n  constructor (ptr) {\n')
      body.push('    super(ptr)\n')
      body.push('  }\n')

      // events
      if (protocolItf.hasOwnProperty('event')) {
        const itfEvents = protocolItf.event
        for (let j = 0; j < itfEvents.length; j++) {
          this._parseItfEvent(requires, body, itfEvents[j], j, i)
        }
      }

      body.push('}\n\n')

      // set name as static class property
      body.push(util.format('%s.name = \'%s\'\n\n', className, itfName))

      // wayland interface declarations
      body.push(util.format('%s.interface_ = Interface.create(\'%s\', %d, [\n', itfName, itfName, i))
      if (protocolItf.hasOwnProperty('request')) {
        const itfRequests = protocolItf.request
        for (let j = 0; j < itfRequests.length; j++) {
          const sinceVersion = itfRequests[j].$.hasOwnProperty('since') ? parseInt(itfRequests[j].$.since) : 1
          if (sinceVersion > i) {
            continue
          }

          if (j > 0) {
            body.push(',\n')
          }
          this._parseItfReqDef(requires, body, itfRequests[j], j, i, sinceVersion)
        }
      }

      body.push('\n], [\n')
      if (protocolItf.hasOwnProperty('event')) {
        const itfEvents = protocolItf.event
        for (let j = 0; j < itfEvents.length; j++) {
          const sinceVersion = itfEvents[j].$.hasOwnProperty('since') ? parseInt(itfEvents[j].$.since) : 1
          if (sinceVersion > i) {
            continue
          }

          if (j > 0) {
            body.push(',\n')
          }
          this._parseItfEventDef(requires, body, itfEvents[j], j, i, sinceVersion)
        }
      }

      body.push('])\n\n')

      // module exports
      body.push(util.format('namespace.%s = %s\n', className, className))
      body.push(util.format('module.exports = %s\n', className))

      let out
      if (outDir === undefined) {
        out = fs.createWriteStream(util.format('%s.js', className))
      } else {
        out = fs.createWriteStream(util.format('%s/%s.js', outDir, className))
      }
      out.on('open', (fd) => {
        copyrights.forEach((line) => {
          out.write(line)
        })
        out.write('\n')
        requires.filter(function (item, pos, self) {
          return self.indexOf(item) === pos
        }).forEach((line) => {
          out.write(line)
        })
        out.write('\n')
        body.forEach((line) => {
          out.write(line)
        })
      })
    }
  }

  _parseProtocol (jsonProtocol, outDir) {
    const copyright = jsonProtocol.protocol.copyright
    jsonProtocol.protocol.interface.forEach((itf) => {
      this._parseInterface(itf, copyright, outDir)
    })
    console.log('Done')
  }

  parse (outDir) {
    let appRoot
    if (this.protocolFile.substring(0, 1) === '/') {
      appRoot = ''
    } else {
      appRoot = process.env.PWD
    }

    fs.readFile(appRoot + '/' + this.protocolFile, (err, data) => {
      if (err) throw err
      new xml2js.Parser().parseString(data, (err, result) => {
        if (err) throw err

        // uncomment to see the protocol as json output
        //console.log(util.inspect(result, false, null))

        this._parseProtocol(result, outDir)
      })
    })
  }

  constructor (protocolFile) {
    this.protocolFile = protocolFile
  }
}

const cli = meow(`Usage:
        wayland-scanner-server.js FILE... [options]

    Generates a javascript server-side protocol file based on the given FILE argument(s).
    The FILE argument is a relative or absolute path to a Wayland XML.

    Options:
        -o, --out          output directory
        -h, --help         print usage information
        -v, --version      show version info and exit
        
`, {
  alias: {
    o: 'out'
  }
})

if (cli.input.length === 0) {
  cli.showHelp()
}

let outDir = cli.flags.o
cli.input.forEach((protocol) => {
  new wfg.ProtocolParser(protocol).parse(outDir)
})
