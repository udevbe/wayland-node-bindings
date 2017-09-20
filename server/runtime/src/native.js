'use strict'

const fastcall = require('fastcall')
const Library = fastcall.Library

const lib = new Library('libwayland-server.so.0')

// util
lib.struct('struct wl_list { void *prev; void *next; }')
lib.struct('struct wl_object {}')
lib.struct('struct wl_array { size_t size; size_t alloc; void *data; }')
lib.union('union wl_argument { int32 i; uint32 u; uint32 f; char *s; wl_object *o; uint32 n; wl_array *a; int32 h; }')
lib.array('wl_argument[] ArgsArray')
lib.struct('struct wl_message { char *name; char *signature; void*[] types; }')
lib.array('wl_message[] MessageArray')
lib.struct('struct wl_interface { char *name; int version; int method_count; MessageArray methods; int event_count; MessageArray events; }')

lib.declare('int (*wl_dispatcher_func_t)(void *impl, void *object, uint32 opcode, wl_message *signature, ArgsArray args)')

lib.function('void wl_list_init(wl_list *list)')
lib.function('void wl_array_init(wl_array *array)')
lib.function('void wl_array_release(wl_array *array)')
lib.function('void *wl_array_add(wl_array *array, size_t size)')
lib.function('int wl_array_copy(wl_array *array, wl_array *source)')

// server
lib.struct('struct wl_resource {}')
lib.struct('struct wl_listener { wl_list link; void *notify; }')
lib.struct('struct wl_event_loop {}')
lib.struct('struct wl_event_source {}')
lib.struct('struct wl_client {}')
lib.struct('struct wl_display {}')
lib.struct('struct wl_global {}')
lib.struct('struct wl_shm_buffer {}')
lib.struct('struct wl_shm_pool {}')

// wl_listener
lib.declare('void (*wl_notify_func_t)(wl_listener *listener, void *data)')

// wl_event_loop
lib.declare('int (*wl_event_loop_fd_func_t)(int fd, uint32 mask, void *data)')
lib.declare('int (*wl_event_loop_timer_func_t)(void *data)')
lib.declare('int (*wl_event_loop_signal_func_t)(int signal_number, void *data)')
lib.declare('void (*wl_event_loop_idle_func_t)(void *data)')
lib.function('wl_event_loop *wl_event_loop_create()')
lib.function('void wl_event_loop_destroy(wl_event_loop *loop)')
lib.function('wl_event_source *wl_event_loop_add_fd(wl_event_loop *loop, int fd, uint32 mask, wl_event_loop_fd_func_t func, void *data)')
lib.function('wl_event_source *wl_event_loop_add_timer(wl_event_loop *loop, wl_event_loop_timer_func_t func, void *data)')
lib.function('wl_event_source *wl_event_loop_add_signal(wl_event_loop *loop, int signal_number, wl_event_loop_signal_func_t func, void *data)')
lib.function('int wl_event_loop_dispatch(wl_event_loop *loop, int timeout)')
lib.function('void wl_event_loop_dispatch_idle(wl_event_loop *loop)')
lib.function('wl_event_source * wl_event_loop_add_idle(wl_event_loop *loop, wl_event_loop_idle_func_t func, void *data)')
lib.function('int wl_event_loop_get_fd(wl_event_loop *loop)')
lib.function('void wl_event_loop_add_destroy_listener(wl_event_loop *loop, wl_listener *listener)')
lib.function('wl_listener *wl_event_loop_get_destroy_listener(wl_event_loop *loop, wl_notify_func_t notify)')

// wl_event_source
lib.function('int wl_event_source_fd_update(wl_event_source *source, uint32 mask)')
lib.function('int wl_event_source_timer_update(wl_event_source *source, int ms_delay)')
lib.function('int wl_event_source_remove(wl_event_source *source)')
lib.function('void wl_event_source_check(wl_event_source *source)')

// wl_client
lib.function('wl_client *wl_client_create(wl_display *display, int fd)')
lib.function('wl_list *wl_client_get_link(wl_client *client)')
lib.function('wl_client *wl_client_from_link(wl_list *link)')
lib.function('void wl_client_destroy(wl_client *client)')
lib.function('void wl_client_flush(wl_client *client)')
// lib.function('void wl_client_get_credentials(wl_client *client, pid_t *pid, uid_t *uid, gid_t *gid)')
lib.function('int wl_client_get_fd(wl_client *client)')
lib.function('void wl_client_add_destroy_listener(wl_client *client, wl_listener *listener)')
lib.function('wl_listener * wl_client_get_destroy_listener(wl_client *client, wl_notify_func_t notify)')
lib.function('wl_resource *wl_client_get_object(wl_client *client, uint32 id)')
lib.function('void wl_client_post_no_memory(wl_client *client)')
lib.function('void wl_client_add_resource_created_listener(wl_client *client, wl_listener *listener)')
lib.function('wl_display *wl_client_get_display(wl_client *client)')

// wl_display
lib.declare('bool (*wl_display_global_filter_func_t)(wl_client *client, wl_global *global, void *data)')
lib.function('wl_display *wl_display_create()')
lib.function('void wl_display_destroy(wl_display *display)')
lib.function('wl_event_loop *wl_display_get_event_loop(wl_display *display)')
lib.function('int wl_display_add_socket(wl_display *display, char *name)')
lib.function('char *wl_display_add_socket_auto(wl_display *display)')
lib.function('int wl_display_add_socket_fd(wl_display *display, int sock_fd)')
lib.function('void wl_display_terminate(wl_display *display)')
lib.function('void wl_display_run(wl_display *display)')
lib.function('void wl_display_flush_clients(wl_display *display)')
lib.function('uint32 wl_display_get_serial(wl_display *display)')
lib.function('uint32 wl_display_next_serial(wl_display *display)')
lib.function('void wl_display_add_destroy_listener(wl_display *display, wl_listener *listener)')
lib.function('void wl_display_add_client_created_listener(wl_display *display, wl_listener *listener)')
lib.function('wl_listener * wl_display_get_destroy_listener(wl_display *display, wl_notify_func_t notify)')
lib.function('void wl_display_set_global_filter(wl_display *display, wl_display_global_filter_func_t filter, void *data)')
lib.function('wl_list *wl_display_get_client_list(wl_display *display)')
lib.function('int wl_display_init_shm(wl_display *display)')
lib.function('uint32 *wl_display_add_shm_format(wl_display *display, uint32 format)')

// wl_global
lib.declare('void (*wl_global_bind_func_t)(wl_client *client, void *data, uint32 version, uint32 id)')
lib.function('wl_global *wl_global_create(wl_display *display, wl_interface *interface, int version, void *data, wl_global_bind_func_t bind)')
lib.function('void wl_global_destroy(wl_global *global)')
lib.function('wl_interface *wl_global_get_interface(wl_global *global)')
lib.function('void *wl_global_get_user_data(wl_global *global)')

// wl_resource
lib.declare('void (*wl_resource_destroy_func_t)(wl_resource *resource)')
lib.function('void wl_resource_post_event_array(wl_resource *resource, uint32 opcode, ArgsArray args)')
lib.function('void wl_resource_queue_event_array(wl_resource *resource, uint32 opcode, ArgsArray args)')
lib.function('void wl_resource_post_error(wl_resource *resource, uint32 code, char *msg)')
lib.function('void wl_resource_post_no_memory(wl_resource *resource)')
lib.function('wl_resource * wl_resource_create(wl_client *client, wl_interface *interface, int version, uint32 id)')
lib.function('void wl_resource_set_implementation(wl_resource *resource, void *implementation, void *data, wl_resource_destroy_func_t destroy)')
lib.function('void wl_resource_set_dispatcher(wl_resource *resource, wl_dispatcher_func_t dispatcher, void *implementation, void *data, wl_resource_destroy_func_t destroy)')
lib.function('void wl_resource_destroy(wl_resource *resource)')
lib.function('uint32 wl_resource_get_id(wl_resource *resource)')
lib.function('wl_list *wl_resource_get_link(wl_resource *resource)')
lib.function('wl_resource *wl_resource_from_link(wl_list *resource)')
lib.function('wl_resource *wl_resource_find_for_client(wl_list *list, wl_client *client)')
lib.function('wl_client *wl_resource_get_client(wl_resource *resource)')
lib.function('void wl_resource_set_user_data(wl_resource *resource, void *data)')
lib.function('void *wl_resource_get_user_data(wl_resource *resource)')
lib.function('int wl_resource_get_version(wl_resource *resource)')
lib.function('void wl_resource_set_destructor(wl_resource *resource, wl_resource_destroy_func_t destroy)')
lib.function('int wl_resource_instance_of(wl_resource *resource, wl_interface *interface, void *implementation)')
lib.function('char * wl_resource_get_class(wl_resource *resource)')
lib.function('void wl_resource_add_destroy_listener(wl_resource *resource, wl_listener *listener)')
lib.function('wl_listener *wl_resource_get_destroy_listener(wl_resource *resource, wl_notify_func_t notify)')

// wl_shm
lib.function('wl_shm_buffer *wl_shm_buffer_get(wl_resource *resource)')
lib.function('void wl_shm_buffer_begin_access(wl_shm_buffer *buffer)')
lib.function('void wl_shm_buffer_end_access(wl_shm_buffer *buffer)')
lib.function('void *wl_shm_buffer_get_data(wl_shm_buffer *buffer)')
lib.function('int32 wl_shm_buffer_get_stride(wl_shm_buffer *buffer)')
lib.function('uint32 wl_shm_buffer_get_format(wl_shm_buffer *buffer)')
lib.function('int32 wl_shm_buffer_get_width(wl_shm_buffer *buffer)')
lib.function('int32 wl_shm_buffer_get_height(wl_shm_buffer *buffer)')

// wl_shm_pool
lib.function('wl_shm_pool *wl_shm_buffer_ref_pool(wl_shm_buffer *buffer)')
lib.function('void wl_shm_pool_unref(wl_shm_pool *pool)')

module.exports = lib
