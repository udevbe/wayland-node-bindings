# wayland-node-bindings
Wayland bindings for Node.js Currently only server side bindings are implemented. 

Bindings are dynamically generated 
using a wayland xml protocol. As such any number of custom wayland protocols is fully supported.

This project exists of 2 parts. A build time protocol generator, and a runtime stubs part. The generator part can be
added your dev dependencies and invoked during build. The runtime part should be added to your runtime dependencies.

This library was developed for and is used in [Greenfield](https://github.com/udevbe/greenfield).

