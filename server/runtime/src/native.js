'use strict'

const fastcall = require('fastcall')
const Library = fastcall.Library

const lib = new Library('libwayland-server.so.0', {
  defaultCallMode: Library.callMode.sync
})

// util
lib.struct('struct wl_list { void *prev; void *next; }')
lib.struct('struct wl_array { size_t size; size_t alloc; void *data; }')
lib.union('union wl_argument { int32 i; uint32 u; int32 f; char *s; void *o; uint32 n; wl_array *a; int32 h; }')
lib.array('wl_argument[] ArgsArray')
lib.struct('struct wl_message { char *name; char *signature; void** types; }')
lib.struct('struct wl_interface { char *name; int version; int method_count; void* methods; int event_count; void* events; }')

lib.declare('int (*wl_dispatcher_func_t)(void *impl, void *object, uint32 opcode, wl_message *signature, ArgsArray args)')

lib.function('void wl_list_init(wl_list *list)')
lib.function('void wl_array_init(wl_array *array)')
lib.function('void wl_array_release(wl_array *array)')
lib.function('void *wl_array_add(wl_array *array, size_t size)')
lib.function('int wl_array_copy(wl_array *array, wl_array *source)')

// wl_listener
lib.declare('void (*wl_notify_func_t)(void *listener, void *data)')

// server
lib.struct('struct wl_listener { wl_list link; wl_notify_func_t notify; }')

// bindings wrapper
lib.declare('struct wl_wrapper { wl_listener listener; void* jsobject; void* jswrapper; }')

// wl_event_loop
lib.declare('int (*wl_event_loop_fd_func_t)(int fd, uint32 mask, void *data)')
lib.declare('int (*wl_event_loop_timer_func_t)(void *data)')
lib.declare('int (*wl_event_loop_signal_func_t)(int signal_number, void *data)')
lib.declare('void (*wl_event_loop_idle_func_t)(void *data)')
lib.function('void *wl_event_loop_create()')
lib.function('void wl_event_loop_destroy(void *loop)')
lib.function('void *wl_event_loop_add_fd(void *loop, int fd, uint32 mask, wl_event_loop_fd_func_t func, void *data)')
lib.function('void *wl_event_loop_add_timer(void *loop, wl_event_loop_timer_func_t func, void *data)')
lib.function('void *wl_event_loop_add_signal(void *loop, int signal_number, wl_event_loop_signal_func_t func, void *data)')
lib.function('int wl_event_loop_dispatch(void *loop, int timeout)')
lib.function('void wl_event_loop_dispatch_idle(void *loop)')
lib.function('void * wl_event_loop_add_idle(void *loop, wl_event_loop_idle_func_t func, void *data)')
lib.function('int wl_event_loop_get_fd(void *loop)')
lib.function('void wl_event_loop_add_destroy_listener(void *loop, wl_listener *listener)')
lib.function('wl_listener *wl_event_loop_get_destroy_listener(void *loop, wl_notify_func_t notify)')

// wl_event_source
lib.function('int wl_event_source_fd_update(void *source, uint32 mask)')
lib.function('int wl_event_source_timer_update(void *source, int ms_delay)')
lib.function('int wl_event_source_remove(void *source)')
lib.function('void wl_event_source_check(void *source)')

// wl_client
lib.function('void *wl_client_create(void *display, int fd)')
lib.function('wl_list *wl_client_get_link(void *client)')
lib.function('void *wl_client_from_link(wl_list *link)')
lib.function('void wl_client_destroy(void *client)')
lib.function('void wl_client_flush(void *client)')
// lib.function('void wl_client_get_credentials(void *client, pid_t *pid, uid_t *uid, gid_t *gid)')
lib.function('int wl_client_get_fd(void *client)')
lib.function('void wl_client_add_destroy_listener(void *client, wl_listener *listener)')
lib.function('wl_listener * wl_client_get_destroy_listener(void *client, wl_notify_func_t notify)')
lib.function('void *wl_client_get_object(void *client, uint32 id)')
lib.function('void wl_client_post_no_memory(void *client)')
lib.function('void wl_client_add_resource_created_listener(void *client, wl_listener *listener)')
lib.function('void *wl_client_get_display(void *client)')

// wl_display
lib.function('void *wl_display_create()')
lib.function('void wl_display_destroy(void *display)')
lib.function('void *wl_display_get_event_loop(void *display)')
lib.function('int wl_display_add_socket(void *display, char *name)')
lib.function('char *wl_display_add_socket_auto(void *display)')
lib.function('int wl_display_add_socket_fd(void *display, int sock_fd)')
lib.function('void wl_display_terminate(void *display)')
lib.function('void wl_display_run(void *display)')
lib.function('void wl_display_flush_clients(void *display)')
lib.function('uint32 wl_display_get_serial(void *display)')
lib.function('uint32 wl_display_next_serial(void *display)')
lib.function('void wl_display_add_destroy_listener(void *display, wl_listener *listener)')
lib.function('void wl_display_add_client_created_listener(void *display, wl_listener *listener)')
lib.function('wl_listener * wl_display_get_destroy_listener(void *display, wl_notify_func_t notify)')
lib.function('wl_list *wl_display_get_client_list(void *display)')
lib.function('int wl_display_init_shm(void *display)')
lib.function('uint32 *wl_display_add_shm_format(void *display, uint32 format)')

// wl_global
lib.declare('void (*wl_global_bind_func_t)(void *client, void *data, uint32 version, uint32 id)')
lib.function('void *wl_global_create(void *display, wl_interface *interface, int version, void *data, wl_global_bind_func_t bind)')
lib.function('void wl_global_destroy(void *global)')

// wl_resource
lib.declare('void (*wl_resource_destroy_func_t)(void *resource)')
lib.function('void wl_resource_post_event_array(void *resource, uint32 opcode, ArgsArray args)')
lib.function('void wl_resource_queue_event_array(void *resource, uint32 opcode, ArgsArray args)')
lib.function('void wl_resource_post_error(void *resource, uint32 code, char *msg)')
lib.function('void wl_resource_post_no_memory(void *resource)')
lib.function('void * wl_resource_create(void *client, wl_interface *interface, int version, uint32 id)')
lib.function('void wl_resource_set_implementation(void *resource, void *implementation, void *data, wl_resource_destroy_func_t destroy)')
lib.function('void wl_resource_set_dispatcher(void *resource, wl_dispatcher_func_t dispatcher, void *implementation, void *data, wl_resource_destroy_func_t destroy)')
lib.function('void wl_resource_destroy(void *resource)')
lib.function('uint32 wl_resource_get_id(void *resource)')
lib.function('wl_list *wl_resource_get_link(void *resource)')
lib.function('void *wl_resource_from_link(wl_list *resource)')
lib.function('void *wl_resource_find_for_client(wl_list *list, void *client)')
lib.function('void *wl_resource_get_client(void *resource)')
lib.function('void wl_resource_set_user_data(void *resource, void *data)')
lib.function('void *wl_resource_get_user_data(void *resource)')
lib.function('int wl_resource_get_version(void *resource)')
lib.function('void wl_resource_set_destructor(void *resource, wl_resource_destroy_func_t destroy)')
lib.function('int wl_resource_instance_of(void *resource, wl_interface *interface, void *implementation)')
lib.function('char * wl_resource_get_class(void *resource)')
lib.function('void wl_resource_add_destroy_listener(void *resource, wl_listener *listener)')
lib.function('wl_listener *wl_resource_get_destroy_listener(void *resource, wl_notify_func_t notify)')

// wl_shm
lib.function('void *wl_shm_buffer_get(void *resource)')
lib.function('void wl_shm_buffer_begin_access(void *buffer)')
lib.function('void wl_shm_buffer_end_access(void *buffer)')
lib.function('void *wl_shm_buffer_get_data(void *buffer)')
lib.function('int32 wl_shm_buffer_get_stride(void *buffer)')
lib.function('uint32 wl_shm_buffer_get_format(void *buffer)')
lib.function('int32 wl_shm_buffer_get_width(void *buffer)')
lib.function('int32 wl_shm_buffer_get_height(void *buffer)')

// wl_shm_pool
lib.function('void *wl_shm_buffer_ref_pool(void *buffer)')
lib.function('void wl_shm_pool_unref(void *pool)')

module.exports = lib
