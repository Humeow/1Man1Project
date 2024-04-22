
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    /**
     * List of attributes that should always be set through the attr method,
     * because updating them through the property setter doesn't work reliably.
     * In the example of `width`/`height`, the problem is that the setter only
     * accepts numeric values, but the attribute can also be set to a string like `50%`.
     * If this list becomes too big, rethink this approach.
     */
    const always_set_through_set_attribute = ['width', 'height'];
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function debug(file, line, column, values) {
        console.log(`{@debug} ${file ? file + ' ' : ''}(${line}:${column})`); // eslint-disable-line no-console
        console.log(values); // eslint-disable-line no-console
        return '';
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const LOCATION = {};
    const ROUTER = {};
    const HISTORY = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const PARAM = /^:(.+)/;
    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Split up the URI into segments delimited by `/`
     * Strip starting/ending `/`
     * @param {string} uri
     * @return {string[]}
     */
    const segmentize = (uri) => uri.replace(/(^\/+|\/+$)/g, "").split("/");
    /**
     * Strip `str` of potential start and end `/`
     * @param {string} string
     * @return {string}
     */
    const stripSlashes = (string) => string.replace(/(^\/+|\/+$)/g, "");
    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    const rankRoute = (route, index) => {
        const score = route.default
            ? 0
            : segmentize(route.path).reduce((score, segment) => {
                  score += SEGMENT_POINTS;

                  if (segment === "") {
                      score += ROOT_POINTS;
                  } else if (PARAM.test(segment)) {
                      score += DYNAMIC_POINTS;
                  } else if (segment[0] === "*") {
                      score -= SEGMENT_POINTS + SPLAT_PENALTY;
                  } else {
                      score += STATIC_POINTS;
                  }

                  return score;
              }, 0);

        return { route, score, index };
    };
    /**
     * Give a score to all routes and sort them on that
     * If two routes have the exact same score, we go by index instead
     * @param {object[]} routes
     * @return {object[]}
     */
    const rankRoutes = (routes) =>
        routes
            .map(rankRoute)
            .sort((a, b) =>
                a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
            );
    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    const pick = (routes, uri) => {
        let match;
        let default_;

        const [uriPathname] = uri.split("?");
        const uriSegments = segmentize(uriPathname);
        const isRootUri = uriSegments[0] === "";
        const ranked = rankRoutes(routes);

        for (let i = 0, l = ranked.length; i < l; i++) {
            const route = ranked[i].route;
            let missed = false;

            if (route.default) {
                default_ = {
                    route,
                    params: {},
                    uri,
                };
                continue;
            }

            const routeSegments = segmentize(route.path);
            const params = {};
            const max = Math.max(uriSegments.length, routeSegments.length);
            let index = 0;

            for (; index < max; index++) {
                const routeSegment = routeSegments[index];
                const uriSegment = uriSegments[index];

                if (routeSegment && routeSegment[0] === "*") {
                    // Hit a splat, just grab the rest, and return a match
                    // uri:   /files/documents/work
                    // route: /files/* or /files/*splatname
                    const splatName =
                        routeSegment === "*" ? "*" : routeSegment.slice(1);

                    params[splatName] = uriSegments
                        .slice(index)
                        .map(decodeURIComponent)
                        .join("/");
                    break;
                }

                if (typeof uriSegment === "undefined") {
                    // URI is shorter than the route, no match
                    // uri:   /users
                    // route: /users/:userId
                    missed = true;
                    break;
                }

                const dynamicMatch = PARAM.exec(routeSegment);

                if (dynamicMatch && !isRootUri) {
                    const value = decodeURIComponent(uriSegment);
                    params[dynamicMatch[1]] = value;
                } else if (routeSegment !== uriSegment) {
                    // Current segments don't match, not dynamic, not splat, so no match
                    // uri:   /users/123/settings
                    // route: /users/:id/profile
                    missed = true;
                    break;
                }
            }

            if (!missed) {
                match = {
                    route,
                    params,
                    uri: "/" + uriSegments.slice(0, index).join("/"),
                };
                break;
            }
        }

        return match || default_ || null;
    };
    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    const addQuery = (pathname, query) => pathname + (query ? `?${query}` : "");
    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    const resolve = (to, base) => {
        // /foo/bar, /baz/qux => /foo/bar
        if (to.startsWith("/")) return to;

        const [toPathname, toQuery] = to.split("?");
        const [basePathname] = base.split("?");
        const toSegments = segmentize(toPathname);
        const baseSegments = segmentize(basePathname);

        // ?a=b, /users?b=c => /users?a=b
        if (toSegments[0] === "") return addQuery(basePathname, toQuery);

        // profile, /users/789 => /users/789/profile

        if (!toSegments[0].startsWith(".")) {
            const pathname = baseSegments.concat(toSegments).join("/");
            return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
        }

        // ./       , /users/123 => /users/123
        // ../      , /users/123 => /users
        // ../..    , /users/123 => /
        // ../../one, /a/b/c/d   => /a/b/one
        // .././one , /a/b/c/d   => /a/b/c/one
        const allSegments = baseSegments.concat(toSegments);
        const segments = [];

        allSegments.forEach((segment) => {
            if (segment === "..") segments.pop();
            else if (segment !== ".") segments.push(segment);
        });

        return addQuery("/" + segments.join("/"), toQuery);
    };
    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    const combinePaths = (basepath, path) =>
        `${stripSlashes(
        path === "/"
            ? basepath
            : `${stripSlashes(basepath)}/${stripSlashes(path)}`
    )}/`;
    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    const shouldNavigate = (event) =>
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

    const canUseDOM = () =>
        typeof window !== "undefined" &&
        "document" in window &&
        "location" in window;

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.59.2 */
    const file$h = "node_modules/svelte-routing/src/Link.svelte";
    const get_default_slot_changes$2 = dirty => ({ active: dirty & /*ariaCurrent*/ 4 });
    const get_default_slot_context$2 = ctx => ({ active: !!/*ariaCurrent*/ ctx[2] });

    function create_fragment$j(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], get_default_slot_context$2);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$h, 41, 0, 1414);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, ariaCurrent*/ 65540)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, get_default_slot_changes$2),
    						get_default_slot_context$2
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps","preserveScroll"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	let { preserveScroll = false } = $$props;
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(14, $location = value));
    	const { base } = getContext(ROUTER);
    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(15, $base = value));
    	const { navigate } = getContext(HISTORY);
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	const onClick = event => {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, {
    				state,
    				replace: shouldReplace,
    				preserveScroll
    			});
    		}
    	};

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('preserveScroll' in $$new_props) $$invalidate(11, preserveScroll = $$new_props.preserveScroll);
    		if ('$$scope' in $$new_props) $$invalidate(16, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		getContext,
    		HISTORY,
    		LOCATION,
    		ROUTER,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		preserveScroll,
    		location,
    		base,
    		navigate,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		ariaCurrent,
    		$location,
    		$base
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('to' in $$props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('preserveScroll' in $$props) $$invalidate(11, preserveScroll = $$new_props.preserveScroll);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('isPartiallyCurrent' in $$props) $$invalidate(12, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ('isCurrent' in $$props) $$invalidate(13, isCurrent = $$new_props.isCurrent);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    		if ('ariaCurrent' in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 32896) {
    			$$invalidate(0, href = resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 16385) {
    			$$invalidate(12, isPartiallyCurrent = $location.pathname.startsWith(href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 16385) {
    			$$invalidate(13, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 8192) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		$$invalidate(1, props = getProps({
    			location: $location,
    			href,
    			isPartiallyCurrent,
    			isCurrent,
    			existingProps: $$restProps
    		}));
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		location,
    		base,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		preserveScroll,
    		isPartiallyCurrent,
    		isCurrent,
    		$location,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10,
    			preserveScroll: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get preserveScroll() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set preserveScroll(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.59.2 */
    const get_default_slot_changes$1 = dirty => ({ params: dirty & /*routeParams*/ 4 });
    const get_default_slot_context$1 = ctx => ({ params: /*routeParams*/ ctx[2] });

    // (42:0) {#if $activeRoute && $activeRoute.route === route}
    function create_if_block$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$5, create_else_block$6];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(42:0) {#if $activeRoute && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (51:4) {:else}
    function create_else_block$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams*/ 132)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(51:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#if component}
    function create_if_block_1$5(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 12,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*component*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*component*/ 1 && promise !== (promise = /*component*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(43:4) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_catch_block$2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(1:0) <script>     import { getContext, onDestroy }",
    		ctx
    	});

    	return block;
    }

    // (44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}
    function create_then_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*routeParams*/ ctx[2], /*routeProps*/ ctx[3]];
    	var switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*routeParams, routeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_pending_block$2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(1:0) <script>     import { getContext, onDestroy }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let routeParams = {};
    	let routeProps = {};
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	registerRoute(route);

    	onDestroy(() => {
    		unregisterRoute(route);
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		canUseDOM,
    		path,
    		component,
    		routeParams,
    		routeProps,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		route,
    		$activeRoute
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($activeRoute && $activeRoute.route === route) {
    			$$invalidate(2, routeParams = $activeRoute.params);
    			const { component: c, path, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);

    			if (c) {
    				if (c.toString().startsWith("class ")) $$invalidate(0, component = c); else $$invalidate(0, component = c());
    			}

    			canUseDOM() && !$activeRoute.preserveScroll && window?.scrollTo(0, 0);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		activeRoute,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { path: 6, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const getLocation$1 = (source) => {
        return {
            ...source.location,
            state: source.history.state,
            key: (source.history.state && source.history.state.key) || "initial",
        };
    };
    const createHistory = (source) => {
        const listeners = [];
        let location = getLocation$1(source);

        return {
            get location() {
                return location;
            },

            listen(listener) {
                listeners.push(listener);

                const popstateListener = () => {
                    location = getLocation$1(source);
                    listener({ location, action: "POP" });
                };

                source.addEventListener("popstate", popstateListener);

                return () => {
                    source.removeEventListener("popstate", popstateListener);
                    const index = listeners.indexOf(listener);
                    listeners.splice(index, 1);
                };
            },

            navigate(to, { state, replace = false, preserveScroll = false, blurActiveElement = true } = {}) {
                state = { ...state, key: Date.now() + "" };
                // try...catch iOS Safari limits to 100 pushState calls
                try {
                    if (replace) source.history.replaceState(state, "", to);
                    else source.history.pushState(state, "", to);
                } catch (e) {
                    source.location[replace ? "replace" : "assign"](to);
                }
                location = getLocation$1(source);
                listeners.forEach((listener) =>
                    listener({ location, action: "PUSH", preserveScroll })
                );
                if(blurActiveElement) document.activeElement.blur();
            },
        };
    };
    // Stores history entries in memory for testing or other platforms like Native
    const createMemorySource = (initialPathname = "/") => {
        let index = 0;
        const stack = [{ pathname: initialPathname, search: "" }];
        const states = [];

        return {
            get location() {
                return stack[index];
            },
            addEventListener(name, fn) {},
            removeEventListener(name, fn) {},
            history: {
                get entries() {
                    return stack;
                },
                get index() {
                    return index;
                },
                get state() {
                    return states[index];
                },
                pushState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    index++;
                    stack.push({ pathname, search });
                    states.push(state);
                },
                replaceState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    stack[index] = { pathname, search };
                    states[index] = state;
                },
            },
        };
    };
    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const globalHistory = createHistory(
        canUseDOM() ? window : createMemorySource()
    );

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1 } = globals;
    const file$g = "node_modules/svelte-routing/src/Router.svelte";

    const get_default_slot_changes_1 = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context_1 = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    const get_default_slot_changes = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    // (143:0) {:else}
    function create_else_block$5(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context_1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes_1),
    						get_default_slot_context_1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(143:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (134:0) {#if viewtransition}
    function create_if_block$6(ctx) {
    	let previous_key = /*$location*/ ctx[1].pathname;
    	let key_block_anchor;
    	let current;
    	let key_block = create_key_block$1(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$location*/ 2 && safe_not_equal(previous_key, previous_key = /*$location*/ ctx[1].pathname)) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block$1(ctx);
    				key_block.c();
    				transition_in(key_block, 1);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(134:0) {#if viewtransition}",
    		ctx
    	});

    	return block;
    }

    // (135:4) {#key $location.pathname}
    function create_key_block$1(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$g, 135, 8, 4659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, /*viewtransitionFn*/ ctx[3], {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*viewtransitionFn*/ ctx[3], {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block$1.name,
    		type: "key",
    		source: "(135:4) {#key $location.pathname}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*viewtransition*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	let { viewtransition = null } = $$props;
    	let { history = globalHistory } = $$props;

    	const viewtransitionFn = (node, _, direction) => {
    		const vt = viewtransition(direction);
    		if (typeof vt?.fn === "function") return vt.fn(node, vt); else return vt;
    	};

    	setContext(HISTORY, history);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(12, $routes = value));
    	const activeRoute = writable(null);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(2, $activeRoute = value));
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : history.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(1, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(13, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (!activeRoute) return base;

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	const registerRoute = route => {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) return;

    			const matchingRoute = pick([route], $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => [...rs, route]);
    		}
    	};

    	const unregisterRoute = route => {
    		routes.update(rs => rs.filter(r => r !== route));
    	};

    	let preserveScroll = false;

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(event => {
    				$$invalidate(11, preserveScroll = event.preserveScroll || false);
    				location.set(event.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url', 'viewtransition', 'history'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(9, url = $$props.url);
    		if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ('history' in $$props) $$invalidate(10, history = $$props.history);
    		if ('$$scope' in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		setContext,
    		derived,
    		writable,
    		HISTORY,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		combinePaths,
    		pick,
    		basepath,
    		url,
    		viewtransition,
    		history,
    		viewtransitionFn,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		preserveScroll,
    		$location,
    		$routes,
    		$base,
    		$activeRoute
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(9, url = $$props.url);
    		if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ('history' in $$props) $$invalidate(10, history = $$props.history);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    		if ('preserveScroll' in $$props) $$invalidate(11, preserveScroll = $$props.preserveScroll);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 8192) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;
    				routes.update(rs => rs.map(r => Object.assign(r, { path: combinePaths(basepath, r._path) })));
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location, preserveScroll*/ 6146) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch ? { ...bestMatch, preserveScroll } : bestMatch);
    			}
    		}
    	};

    	return [
    		viewtransition,
    		$location,
    		$activeRoute,
    		viewtransitionFn,
    		routes,
    		activeRoute,
    		location,
    		base,
    		basepath,
    		url,
    		history,
    		preserveScroll,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			basepath: 8,
    			url: 9,
    			viewtransition: 0,
    			history: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewtransition() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewtransition(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get history() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set history(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Home/Header.svelte generated by Svelte v3.59.2 */

    const file$f = "src/components/Home/Header.svelte";

    // (34:12) {:else}
    function create_else_block_2$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$f, 34, 16, 1600);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$1.name,
    		type: "else",
    		source: "(34:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (29:12) {#if (writeOutput.success)}
    function create_if_block_2$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");

    			div.textContent = `최근 수정 시각: ${/*timeEdit*/ ctx[3].slice(0, 4)}-${/*timeEdit*/ ctx[3].slice(4, 6)}-${/*timeEdit*/ ctx[3].slice(6, 8)} 
                    ${/*timeEdit*/ ctx[3].slice(8, 10)}:${/*timeEdit*/ ctx[3].slice(10, 12)}:${/*timeEdit*/ ctx[3].slice(12, 14)}`;

    			add_location(div, file$f, 29, 16, 1337);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(29:12) {#if (writeOutput.success)}",
    		ctx
    	});

    	return block;
    }

    // (84:8) {:else}
    function create_else_block_1$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$f, 84, 12, 6378);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(84:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:8) {#if (writeOutput.success)}
    function create_if_block$5(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let input;
    	let t0;
    	let t1;
    	let a;
    	let svg;
    	let path_1;
    	let t2;
    	let t3;
    	let div2;

    	function select_block_type_2(ctx, dirty) {
    		if (/*isEditable*/ ctx[2]) return create_if_block_1$4;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			if_block.c();
    			t1 = space();
    			a = element("a");
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			t2 = text("\r\n                         역사");
    			t3 = space();
    			div2 = element("div");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", "modal");
    			attr_dev(input, "class", "edit_box svelte-lczm8w");
    			attr_dev(input, "data-v-f71337ee", "");
    			add_location(input, file$f, 41, 24, 1809);
    			add_location(div0, file$f, 40, 20, 1778);
    			attr_dev(path_1, "d", "M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z");
    			add_location(path_1, file$f, 73, 28, 5768);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "height", "1em");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			attr_dev(svg, "class", "svelte-lczm8w");
    			add_location(svg, file$f, 72, 24, 5663);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "history1 svelte-lczm8w");
    			add_location(a, file$f, 71, 20, 5608);
    			attr_dev(div1, "id", "head_button");
    			attr_dev(div1, "class", "svelte-lczm8w");
    			add_location(div1, file$f, 39, 16, 1734);
    			add_location(div2, file$f, 79, 16, 6296);
    			attr_dev(div3, "id", "head_div");
    			attr_dev(div3, "class", "svelte-lczm8w");
    			add_location(div3, file$f, 38, 12, 1697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			append_dev(div0, t0);
    			if_block.m(div0, null);
    			append_dev(div1, t1);
    			append_dev(div1, a);
    			append_dev(a, svg);
    			append_dev(svg, path_1);
    			append_dev(a, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(38:8) {#if (writeOutput.success)}",
    		ctx
    	});

    	return block;
    }

    // (54:24) {:else}
    function create_else_block$4(ctx) {
    	let label;
    	let span2;
    	let span1;
    	let svg;
    	let path_1;
    	let t0;
    	let span0;

    	const block = {
    		c: function create() {
    			label = element("label");
    			span2 = element("span");
    			span1 = element("span");
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "편집";
    			attr_dev(path_1, "d", "M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z");
    			add_location(path_1, file$f, 58, 44, 3634);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "class", "svelte-lczm8w");
    			add_location(svg, file$f, 57, 40, 3503);
    			add_location(span0, file$f, 60, 40, 4405);
    			add_location(span1, file$f, 56, 36, 3455);
    			attr_dev(span2, "class", "edit1 svelte-lczm8w");
    			set_style(span2, "background-color", "lightgray");
    			add_location(span2, file$f, 55, 32, 3360);
    			attr_dev(label, "for", "modal");
    			attr_dev(label, "class", "edit_button svelte-lczm8w");
    			attr_dev(label, "data-v-f71337ee", "");
    			add_location(label, file$f, 54, 28, 3268);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span2);
    			append_dev(span2, span1);
    			append_dev(span1, svg);
    			append_dev(svg, path_1);
    			append_dev(span1, t0);
    			append_dev(span1, span0);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(54:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:24) {#if isEditable}
    function create_if_block_1$4(ctx) {
    	let label;
    	let span1;
    	let a;
    	let svg;
    	let path_1;
    	let t0;
    	let span0;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			span1 = element("span");
    			a = element("a");
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "편집";
    			attr_dev(path_1, "d", "M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z");
    			add_location(path_1, file$f, 47, 44, 2298);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "class", "svelte-lczm8w");
    			add_location(svg, file$f, 46, 40, 2167);
    			add_location(span0, file$f, 49, 40, 3069);
    			attr_dev(a, "href", a_href_value = "/edit/" + /*path*/ ctx[0]);
    			add_location(a, file$f, 45, 36, 2102);
    			attr_dev(span1, "class", "edit1 svelte-lczm8w");
    			add_location(span1, file$f, 44, 32, 2043);
    			attr_dev(label, "for", "modal");
    			attr_dev(label, "class", "edit_button svelte-lczm8w");
    			attr_dev(label, "data-v-f71337ee", "");
    			add_location(label, file$f, 43, 28, 1951);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span1);
    			append_dev(span1, a);
    			append_dev(a, svg);
    			append_dev(svg, path_1);
    			append_dev(a, t0);
    			append_dev(a, span0);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path*/ 1 && a_href_value !== (a_href_value = "/edit/" + /*path*/ ctx[0])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(43:24) {#if isEditable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let header;
    	let div1;
    	let div0;
    	let p;
    	let t0;
    	let t1;
    	let t2;

    	function select_block_type(ctx, dirty) {
    		if (/*writeOutput*/ ctx[1].success) return create_if_block_2$2;
    		return create_else_block_2$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*writeOutput*/ ctx[1].success) return create_if_block$5;
    		return create_else_block_1$2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			t0 = text(/*path*/ ctx[0]);
    			t1 = space();
    			if_block0.c();
    			t2 = space();
    			if_block1.c();
    			attr_dev(p, "id", "title");
    			attr_dev(p, "class", "svelte-lczm8w");
    			add_location(p, file$f, 18, 12, 626);
    			attr_dev(div0, "id", "head_line_div");
    			attr_dev(div0, "class", "svelte-lczm8w");
    			add_location(div0, file$f, 17, 8, 588);
    			attr_dev(div1, "id", "head_title");
    			attr_dev(div1, "class", "svelte-lczm8w");
    			add_location(div1, file$f, 16, 4, 557);
    			attr_dev(header, "class", "svelte-lczm8w");
    			add_location(header, file$f, 15, 0, 543);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			append_dev(div0, t1);
    			if_block0.m(div0, null);
    			append_dev(div1, t2);
    			if_block1.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*path*/ 1) set_data_dev(t0, /*path*/ ctx[0]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if_block0.d();
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { path = '' } = $$props;
    	let { writeOutput = { data: { authority: 2000 } } } = $$props;
    	let { UserOutput = { data: { authority: 4 } } } = $$props;
    	let tempAuthorityUser;

    	if (UserOutput.success) {
    		tempAuthorityUser = UserOutput.data.authority;
    	} else {
    		tempAuthorityUser = 4;
    	}

    	const authorityUser = tempAuthorityUser;
    	const authorityWrite = writeOutput.data.authority;
    	const isEditable = Number(authorityWrite.toString()[authorityUser - 1]) % 2;
    	const timeEdit = writeOutput.data.recent_edit;
    	const writable_props = ['path', 'writeOutput', 'UserOutput'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    		if ('writeOutput' in $$props) $$invalidate(1, writeOutput = $$props.writeOutput);
    		if ('UserOutput' in $$props) $$invalidate(4, UserOutput = $$props.UserOutput);
    	};

    	$$self.$capture_state = () => ({
    		path,
    		writeOutput,
    		UserOutput,
    		tempAuthorityUser,
    		authorityUser,
    		authorityWrite,
    		isEditable,
    		timeEdit
    	});

    	$$self.$inject_state = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    		if ('writeOutput' in $$props) $$invalidate(1, writeOutput = $$props.writeOutput);
    		if ('UserOutput' in $$props) $$invalidate(4, UserOutput = $$props.UserOutput);
    		if ('tempAuthorityUser' in $$props) tempAuthorityUser = $$props.tempAuthorityUser;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [path, writeOutput, isEditable, timeEdit, UserOutput];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { path: 0, writeOutput: 1, UserOutput: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get path() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get writeOutput() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set writeOutput(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get UserOutput() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set UserOutput(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Home/Nav.svelte generated by Svelte v3.59.2 */

    const file$e = "src/components/Home/Nav.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (11:4) {#each Categories as category}
    function create_each_block$4(ctx) {
    	let a;
    	let t0_value = /*category*/ ctx[3] + "";
    	let t0;
    	let t1;
    	let div;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");
    			div.textContent = " | ";
    			attr_dev(a, "class", "this_ryu svelte-1dllrhd");
    			attr_dev(a, "href", "/w/분류:" + /*category*/ ctx[3]);
    			add_location(a, file$e, 11, 8, 311);
    			add_location(div, file$e, 12, 8, 379);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(11:4) {#each Categories as category}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let nav;
    	let p;
    	let t1;
    	let t2;
    	let a;
    	let t3;
    	let each_value = /*Categories*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			p = element("p");
    			p.textContent = "분류: ";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			a = element("a");
    			t3 = text(/*lastCategory*/ ctx[1]);
    			attr_dev(p, "class", "this_ryu svelte-1dllrhd");
    			add_location(p, file$e, 8, 4, 196);
    			attr_dev(a, "class", "this_ryu svelte-1dllrhd");
    			attr_dev(a, "href", "/w/분류:" + /*lastCategory*/ ctx[1]);
    			add_location(a, file$e, 14, 4, 422);
    			set_style(nav, "display", "flex");
    			attr_dev(nav, "class", "svelte-1dllrhd");
    			add_location(nav, file$e, 7, 0, 163);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, p);
    			append_dev(nav, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(nav, null);
    				}
    			}

    			append_dev(nav, t2);
    			append_dev(nav, a);
    			append_dev(a, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Categories*/ 1) {
    				each_value = /*Categories*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);
    	let { writeOutput = {} } = $$props;
    	const Categories = writeOutput.data.category.split('|');
    	const lastCategory = Categories.pop();
    	const writable_props = ['writeOutput'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('writeOutput' in $$props) $$invalidate(2, writeOutput = $$props.writeOutput);
    	};

    	$$self.$capture_state = () => ({ writeOutput, Categories, lastCategory });

    	$$self.$inject_state = $$props => {
    		if ('writeOutput' in $$props) $$invalidate(2, writeOutput = $$props.writeOutput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [Categories, lastCategory, writeOutput];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { writeOutput: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get writeOutput() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set writeOutput(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Home/Aside.svelte generated by Svelte v3.59.2 */

    const file$d = "src/components/Home/Aside.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	const constants_0 = /*recordParagraph*/ child_ctx[2](/*match*/ child_ctx[4][0][3]);
    	child_ctx[1] = constants_0;
    	return child_ctx;
    }

    // (27:12) {#each matchesParagraph as match}
    function create_each_block$3(ctx) {
    	let span;
    	let t0_value = ('\u00A0').repeat((/*textParagraph*/ ctx[1][1] - 2) * 2) + "";
    	let t0;
    	let a;
    	let t1_value = /*textParagraph*/ ctx[1][0] + "";
    	let t1;
    	let a_href_value;
    	let t2;
    	let t3_value = /*match*/ ctx[4][0].slice(5, /*match*/ ctx[4][0].length - 2) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			a = element("a");
    			t1 = text(t1_value);
    			t2 = text(". ");
    			t3 = text(t3_value);
    			attr_dev(a, "href", a_href_value = "#para_" + /*textParagraph*/ ctx[1][0]);
    			attr_dev(a, "class", "svelte-jn2msl");
    			add_location(a, file$d, 28, 67, 974);
    			attr_dev(span, "class", "svelte-jn2msl");
    			add_location(span, file$d, 28, 16, 923);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, a);
    			append_dev(a, t1);
    			append_dev(span, t2);
    			append_dev(span, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*matchesParagraph*/ 1 && t0_value !== (t0_value = ('\u00A0').repeat((/*textParagraph*/ ctx[1][1] - 2) * 2) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*matchesParagraph*/ 1 && t1_value !== (t1_value = /*textParagraph*/ ctx[1][0] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*matchesParagraph*/ 1 && a_href_value !== (a_href_value = "#para_" + /*textParagraph*/ ctx[1][0])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*matchesParagraph*/ 1 && t3_value !== (t3_value = /*match*/ ctx[4][0].slice(5, /*match*/ ctx[4][0].length - 2) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(27:12) {#each matchesParagraph as match}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let aside;
    	let div1;
    	let p;
    	let t1;
    	let div0;
    	let each_value = /*matchesParagraph*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "목차";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "id", "index_text");
    			attr_dev(p, "class", "svelte-jn2msl");
    			add_location(p, file$d, 24, 8, 728);
    			attr_dev(div0, "id", "index_content");
    			attr_dev(div0, "class", "svelte-jn2msl");
    			add_location(div0, file$d, 25, 8, 763);
    			attr_dev(div1, "class", "index svelte-jn2msl");
    			add_location(div1, file$d, 23, 4, 699);
    			attr_dev(aside, "class", "svelte-jn2msl");
    			add_location(aside, file$d, 22, 0, 686);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			append_dev(aside, div1);
    			append_dev(div1, p);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*matchesParagraph, recordParagraph*/ 5) {
    				each_value = /*matchesParagraph*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Aside', slots, []);
    	let { matchesParagraph = [] } = $$props;
    	let textParagraph = [0, 0, 0];

    	const resetParagraph = () => {
    		$$invalidate(1, textParagraph = [0, 0, 0]);
    		return true;
    	};

    	const recordParagraph = num => {
    		switch (num) {
    			case '2':
    				$$invalidate(1, textParagraph[1] = $$invalidate(1, textParagraph[2] = 0, textParagraph), textParagraph);
    				return [`${$$invalidate(1, ++textParagraph[0], textParagraph)}`, 2];
    			case '3':
    				$$invalidate(1, textParagraph[2] = 0, textParagraph);
    				return [
    					`${textParagraph[0]}-${$$invalidate(1, ++textParagraph[1], textParagraph)}`,
    					3
    				];
    			default:
    				// 4 and more
    				return [
    					`${textParagraph[0]}-${textParagraph[1]}-${$$invalidate(1, ++textParagraph[2], textParagraph)}`,
    					4
    				];
    		}
    	};

    	resetParagraph();
    	const writable_props = ['matchesParagraph'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Aside> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('matchesParagraph' in $$props) $$invalidate(0, matchesParagraph = $$props.matchesParagraph);
    	};

    	$$self.$capture_state = () => ({
    		matchesParagraph,
    		textParagraph,
    		resetParagraph,
    		recordParagraph
    	});

    	$$self.$inject_state = $$props => {
    		if ('matchesParagraph' in $$props) $$invalidate(0, matchesParagraph = $$props.matchesParagraph);
    		if ('textParagraph' in $$props) $$invalidate(1, textParagraph = $$props.textParagraph);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [matchesParagraph, textParagraph, recordParagraph];
    }

    class Aside extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { matchesParagraph: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Aside",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get matchesParagraph() {
    		throw new Error("<Aside>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set matchesParagraph(value) {
    		throw new Error("<Aside>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Home/Footer.svelte generated by Svelte v3.59.2 */

    function create_fragment$d(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/TextHighlight.svelte generated by Svelte v3.59.2 */

    const file$c = "src/components/TextHighlight.svelte";

    function create_fragment$c(ctx) {
    	let span;
    	let raw_value = /*changeTagByExpression*/ ctx[1](/*splitMatchContent*/ ctx[0][1].split('|'), /*splitMatchContent*/ ctx[0][2]) + "";

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "text_content svelte-orj80v");
    			add_location(span, file$c, 25, 0, 796);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*splitMatchContent*/ 1 && raw_value !== (raw_value = /*changeTagByExpression*/ ctx[1](/*splitMatchContent*/ ctx[0][1].split('|'), /*splitMatchContent*/ ctx[0][2]) + "")) span.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextHighlight', slots, []);
    	let { splitMatchContent = [] } = $$props;

    	const dictTextExpression = {
    		B: 'strong',
    		I: 'em',
    		S: 'del',
    		U: 'u',
    		WU: 'sup',
    		WD: 'sub'
    	};

    	const changeTagByExpression = (syntax, textTag) => {
    		// console.log(syntax, syntax[-1], textTag, '!!!!!!!!!!!')
    		if (syntax.length === 1) {
    			return `<${dictTextExpression[syntax[0]]}>${textTag}</${dictTextExpression[syntax[0]]}>`;
    		}

    		// console.log(`<${dictTextExpression[syntax[0]]}>${textTag}</${dictTextExpression[syntax[0]]}>`)
    		textTag = changeTagByExpression(syntax.shift(), `<${dictTextExpression[syntax[0]]}>${textTag}</${dictTextExpression[syntax[0]]}>`);

    		// console.log('func:', textTag)
    		return textTag;
    	};

    	const writable_props = ['splitMatchContent'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextHighlight> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('splitMatchContent' in $$props) $$invalidate(0, splitMatchContent = $$props.splitMatchContent);
    	};

    	$$self.$capture_state = () => ({
    		splitMatchContent,
    		dictTextExpression,
    		changeTagByExpression
    	});

    	$$self.$inject_state = $$props => {
    		if ('splitMatchContent' in $$props) $$invalidate(0, splitMatchContent = $$props.splitMatchContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [splitMatchContent, changeTagByExpression];
    }

    class TextHighlight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { splitMatchContent: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextHighlight",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get splitMatchContent() {
    		throw new Error("<TextHighlight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set splitMatchContent(value) {
    		throw new Error("<TextHighlight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/EachContent.svelte generated by Svelte v3.59.2 */
    const file$b = "src/components/EachContent.svelte";

    function get_if_ctx_2(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*dictFootnotesText*/ child_ctx[2][/*splitFootnote*/ child_ctx[11][1]];
    	child_ctx[13] = constants_0;
    	const constants_1 = --/*textFootnote*/ child_ctx[13][1];
    	child_ctx[14] = constants_1;
    	return child_ctx;
    }

    function get_if_ctx_1(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*dictTextToFootnote*/ child_ctx[1][/*splitFootnote*/ child_ctx[11][0]];
    	child_ctx[12] = constants_0;
    	return child_ctx;
    }

    function get_if_ctx_3(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*splitMatchContent*/ child_ctx[9][1].split('|');
    	child_ctx[11] = constants_0;
    	return child_ctx;
    }

    function get_if_ctx$1(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*splitMatchContent*/ child_ctx[9][1].split('|');
    	child_ctx[10] = constants_0;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[18] = i;
    	const constants_0 = /*matchesContent*/ child_ctx[3][/*countMatchContent*/ child_ctx[18]];
    	child_ctx[16] = constants_0;
    	const constants_1 = /*matchContent*/ child_ctx[16][1].split(':');
    	child_ctx[9] = constants_1;
    	return child_ctx;
    }

    function get_if_ctx_6(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*dictFootnotesText*/ child_ctx[2][/*splitFootnote*/ child_ctx[11][1]];
    	child_ctx[13] = constants_0;
    	const constants_1 = 1;
    	child_ctx[14] = constants_1;
    	return child_ctx;
    }

    function get_if_ctx_5(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*dictTextToFootnote*/ child_ctx[1][/*splitFootnote*/ child_ctx[11][0]];
    	child_ctx[12] = constants_0;
    	return child_ctx;
    }

    function get_if_ctx_7(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*splitMatchContent*/ child_ctx[9][1].split('|');
    	child_ctx[11] = constants_0;
    	return child_ctx;
    }

    function get_if_ctx_4(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*splitMatchContent*/ child_ctx[9][1].split('|');
    	child_ctx[10] = constants_0;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_if_ctx_8(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*matchesContent*/ child_ctx[3][/*matchesContent*/ child_ctx[3].length - 1];
    	child_ctx[8] = constants_0;
    	const constants_1 = /*lastContent*/ child_ctx[8][1].split(':');
    	child_ctx[9] = constants_1;
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (25:8) {#if (splitContent.length !== 0)}
    function create_if_block_2$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matchesContent*/ ctx[3].length !== 0 && create_if_block_3$1(get_if_ctx_8(ctx));

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*matchesContent*/ ctx[3].length !== 0) if_block.p(get_if_ctx_8(ctx), dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(25:8) {#if (splitContent.length !== 0)}",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#if matchesContent.length === 0}
    function create_if_block$4(ctx) {
    	let each_1_anchor;
    	let each_value = /*splitContent*/ ctx[0].split('\n');
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*splitContent*/ 1) {
    				each_value = /*splitContent*/ ctx[0].split('\n');
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(16:4) {#if matchesContent.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (26:12) {#if matchesContent.length !== 0}
    function create_if_block_3$1(ctx) {
    	let t0;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let t2;
    	let span;
    	let t3_value = /*splitContent*/ ctx[0].slice(/*lastContent*/ ctx[8].index + /*lastContent*/ ctx[8][0].length) + "";
    	let t3;
    	let current;
    	let each_value_2 = /*splitContent*/ ctx[0].slice(0, /*matchesContent*/ ctx[3][0].index).split('\n');
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = {
    		length: /*matchesContent*/ ctx[3].length - 1
    	};

    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const if_block_creators = [create_if_block_4$1, create_if_block_5$1, create_if_block_8, create_if_block_9];
    	const if_blocks = [];

    	function select_block_type_6(ctx, dirty) {
    		if (/*splitMatchContent*/ ctx[9][0] === 'O') return 0;
    		if (/*splitMatchContent*/ ctx[9][0] === 'L') return 1;
    		if (/*splitMatchContent*/ ctx[9][0] === 'P') return 2;
    		if (/*splitMatchContent*/ ctx[9][0] === 'F') return 3;
    		return -1;
    	}

    	function select_block_ctx(ctx, index) {
    		if (index === 1) return get_if_ctx$1(ctx);
    		if (index === 3) return get_if_ctx_3(ctx);
    		return ctx;
    	}

    	if (~(current_block_type_index = select_block_type_6(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](select_block_ctx(ctx, current_block_type_index));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			attr_dev(span, "class", "text_content svelte-c6mash");
    			add_location(span, file$b, 97, 16, 5541);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, t0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, t1, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t3);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*splitContent, matchesContent*/ 9) {
    				each_value_2 = /*splitContent*/ ctx[0].slice(0, /*matchesContent*/ ctx[3][0].index).split('\n');
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(t0.parentNode, t0);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*splitContent, matchesContent, dictTextToFootnote, dictFootnotesText*/ 15) {
    				each_value_1 = {
    					length: /*matchesContent*/ ctx[3].length - 1
    				};

    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t1.parentNode, t1);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (if_block) if_block.p(select_block_ctx(ctx, current_block_type_index), dirty);
    			if ((!current || dirty & /*splitContent*/ 1) && t3_value !== (t3_value = /*splitContent*/ ctx[0].slice(/*lastContent*/ ctx[8].index + /*lastContent*/ ctx[8][0].length) + "")) set_data_dev(t3, t3_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(26:12) {#if matchesContent.length !== 0}",
    		ctx
    	});

    	return block;
    }

    // (32:20) {:else}
    function create_else_block_1$1(ctx) {
    	let span;
    	let t_value = /*firstContextSplit*/ ctx[19] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "text_content svelte-c6mash");
    			add_location(span, file$b, 32, 24, 1281);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*splitContent*/ 1 && t_value !== (t_value = /*firstContextSplit*/ ctx[19] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(32:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:20) {#if firstContextSplit === ''}
    function create_if_block_20(ctx) {
    	let span;
    	let br;

    	const block = {
    		c: function create() {
    			span = element("span");
    			br = element("br");
    			add_location(br, file$b, 30, 52, 1216);
    			attr_dev(span, "class", "text_content svelte-c6mash");
    			add_location(span, file$b, 30, 24, 1188);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, br);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(30:20) {#if firstContextSplit === ''}",
    		ctx
    	});

    	return block;
    }

    // (28:16) {#each splitContent.slice(0, matchesContent[0].index).split('\n') as firstContextSplit}
    function create_each_block_2$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*firstContextSplit*/ ctx[19] === '') return create_if_block_20;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(28:16) {#each splitContent.slice(0, matchesContent[0].index).split('\\n') as firstContextSplit}",
    		ctx
    	});

    	return block;
    }

    // (53:65) 
    function create_if_block_17(ctx) {
    	let if_block_anchor;

    	function select_block_type_5(ctx, dirty) {
    		if (/*splitFootnote*/ ctx[11].length === 1) return create_if_block_18;
    		if (/*splitFootnote*/ ctx[11].length === 2) return create_if_block_19;
    	}

    	function select_block_ctx(ctx, type) {
    		if (type === create_if_block_18) return get_if_ctx_5(ctx);
    		if (type === create_if_block_19) return get_if_ctx_6(ctx);
    	}

    	let current_block_type = select_block_type_5(ctx);
    	let if_block = current_block_type && current_block_type(select_block_ctx(ctx, current_block_type));

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(select_block_ctx(ctx, current_block_type), dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(53:65) ",
    		ctx
    	});

    	return block;
    }

    // (50:65) 
    function create_if_block_16(ctx) {
    	let a;
    	let img;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "href", /*splitMatchContent*/ ctx[9][1]);
    			add_location(img, file$b, 50, 52, 2403);
    			attr_dev(a, "class", "text_content svelte-c6mash");
    			add_location(a, file$b, 50, 28, 2379);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(50:65) ",
    		ctx
    	});

    	return block;
    }

    // (43:24) {#if (splitMatchContent[0] === 'L')}
    function create_if_block_13(ctx) {
    	let if_block_anchor;

    	function select_block_type_4(ctx, dirty) {
    		if (/*splitLink*/ ctx[10].length === 1) return create_if_block_14;
    		if (/*splitLink*/ ctx[10].length === 2) return create_if_block_15;
    	}

    	let current_block_type = select_block_type_4(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(43:24) {#if (splitMatchContent[0] === 'L')}",
    		ctx
    	});

    	return block;
    }

    // (40:20) {#if (splitMatchContent[0] === 'O')}
    function create_if_block_12(ctx) {
    	let texthighlights;
    	let current;

    	texthighlights = new TextHighlight({
    			props: {
    				splitMatchContent: /*splitMatchContent*/ ctx[9]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(texthighlights.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(texthighlights, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(texthighlights.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(texthighlights.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(texthighlights, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(40:20) {#if (splitMatchContent[0] === 'O')}",
    		ctx
    	});

    	return block;
    }

    // (58:67) 
    function create_if_block_19(ctx) {
    	let t0_value = --/*textFootnote*/ ctx[13][1] + "";
    	let t0;
    	let t1;
    	let a;
    	let sup;
    	let t2;
    	let t3_value = /*splitFootnote*/ ctx[11][1] + "";
    	let t3;
    	let t4;
    	let a_id_value;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			a = element("a");
    			sup = element("sup");
    			t2 = text("[");
    			t3 = text(t3_value);
    			t4 = text("]");
    			add_location(sup, file$b, 60, 166, 3324);
    			attr_dev(a, "href", "#bottom_footnote_" + /*splitFootnote*/ ctx[11][1]);
    			attr_dev(a, "id", a_id_value = "" + (/*textFootnote*/ ctx[13][0] + "-" + (/*textFootnote*/ ctx[13][2] - /*countFootnote*/ ctx[14])));
    			attr_dev(a, "class", "footnote text_content svelte-c6mash");
    			add_location(a, file$b, 60, 32, 3190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, sup);
    			append_dev(sup, t2);
    			append_dev(sup, t3);
    			append_dev(sup, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dictFootnotesText*/ 4 && t0_value !== (t0_value = --/*textFootnote*/ ctx[13][1] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*dictFootnotesText*/ 4 && a_id_value !== (a_id_value = "" + (/*textFootnote*/ ctx[13][0] + "-" + (/*textFootnote*/ ctx[13][2] - /*countFootnote*/ ctx[14])))) {
    				attr_dev(a, "id", a_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(58:67) ",
    		ctx
    	});

    	return block;
    }

    // (55:28) {#if (splitFootnote.length === 1)}
    function create_if_block_18(ctx) {
    	let a;
    	let sup;
    	let t0;
    	let t1_value = /*numberParagraph*/ ctx[12] + "";
    	let t1;
    	let t2;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			sup = element("sup");
    			t0 = text("[");
    			t1 = text(t1_value);
    			t2 = text("]");
    			add_location(sup, file$b, 56, 108, 2881);
    			attr_dev(a, "href", a_href_value = "#bottom_footnote_" + /*numberParagraph*/ ctx[12]);
    			attr_dev(a, "class", "footnote text_content svelte-c6mash");
    			add_location(a, file$b, 56, 32, 2805);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, sup);
    			append_dev(sup, t0);
    			append_dev(sup, t1);
    			append_dev(sup, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dictTextToFootnote*/ 2 && t1_value !== (t1_value = /*numberParagraph*/ ctx[12] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*dictTextToFootnote*/ 2 && a_href_value !== (a_href_value = "#bottom_footnote_" + /*numberParagraph*/ ctx[12])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(55:28) {#if (splitFootnote.length === 1)}",
    		ctx
    	});

    	return block;
    }

    // (47:63) 
    function create_if_block_15(ctx) {
    	let a;
    	let t_value = /*splitLink*/ ctx[10][1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", /*splitLink*/ ctx[10][0]);
    			attr_dev(a, "class", "text_content svelte-c6mash");
    			add_location(a, file$b, 47, 32, 2186);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(47:63) ",
    		ctx
    	});

    	return block;
    }

    // (45:28) {#if (splitLink.length === 1)}
    function create_if_block_14(ctx) {
    	let a;
    	let t_value = /*splitLink*/ ctx[10][0] + "";
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", /*splitLink*/ ctx[10][0]);
    			attr_dev(a, "class", "text_content svelte-c6mash");
    			add_location(a, file$b, 45, 32, 2025);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(45:28) {#if (splitLink.length === 1)}",
    		ctx
    	});

    	return block;
    }

    // (36:16) {#each {length: matchesContent.length-1} as _, countMatchContent}
    function create_each_block_1$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let t0;
    	let span;
    	let t1_value = /*splitContent*/ ctx[0].slice(/*matchContent*/ ctx[16].index + /*matchContent*/ ctx[16][0].length, /*matchesContent*/ ctx[3][/*countMatchContent*/ ctx[18] + 1].index) + "";
    	let t1;
    	let current;
    	const if_block_creators = [create_if_block_12, create_if_block_13, create_if_block_16, create_if_block_17];
    	const if_blocks = [];

    	function select_block_type_3(ctx, dirty) {
    		if (/*splitMatchContent*/ ctx[9][0] === 'O') return 0;
    		if (/*splitMatchContent*/ ctx[9][0] === 'L') return 1;
    		if (/*splitMatchContent*/ ctx[9][0] === 'P') return 2;
    		if (/*splitMatchContent*/ ctx[9][0] === 'F') return 3;
    		return -1;
    	}

    	function select_block_ctx(ctx, index) {
    		if (index === 1) return get_if_ctx_4(ctx);
    		if (index === 3) return get_if_ctx_7(ctx);
    		return ctx;
    	}

    	if (~(current_block_type_index = select_block_type_3(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](select_block_ctx(ctx, current_block_type_index));
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			attr_dev(span, "class", "text_content svelte-c6mash");
    			add_location(span, file$b, 65, 20, 3474);
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(select_block_ctx(ctx, current_block_type_index), dirty);
    			if ((!current || dirty & /*splitContent*/ 1) && t1_value !== (t1_value = /*splitContent*/ ctx[0].slice(/*matchContent*/ ctx[16].index + /*matchContent*/ ctx[16][0].length, /*matchesContent*/ ctx[3][/*countMatchContent*/ ctx[18] + 1].index) + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(36:16) {#each {length: matchesContent.length-1} as _, countMatchContent}",
    		ctx
    	});

    	return block;
    }

    // (86:61) 
    function create_if_block_9(ctx) {
    	let if_block_anchor;

    	function select_block_type_8(ctx, dirty) {
    		if (/*splitFootnote*/ ctx[11].length === 1) return create_if_block_10;
    		if (/*splitFootnote*/ ctx[11].length === 2) return create_if_block_11;
    	}

    	function select_block_ctx(ctx, type) {
    		if (type === create_if_block_10) return get_if_ctx_1(ctx);
    		if (type === create_if_block_11) return get_if_ctx_2(ctx);
    	}

    	let current_block_type = select_block_type_8(ctx);
    	let if_block = current_block_type && current_block_type(select_block_ctx(ctx, current_block_type));

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(select_block_ctx(ctx, current_block_type), dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(86:61) ",
    		ctx
    	});

    	return block;
    }

    // (83:61) 
    function create_if_block_8(ctx) {
    	let a;
    	let img;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "href", /*splitMatchContent*/ ctx[9][1]);
    			add_location(img, file$b, 83, 48, 4546);
    			attr_dev(a, "class", "text_content svelte-c6mash");
    			add_location(a, file$b, 83, 24, 4522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(83:61) ",
    		ctx
    	});

    	return block;
    }

    // (75:20) {#if (splitMatchContent[0] === 'L')}
    function create_if_block_5$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_7(ctx, dirty) {
    		if (/*splitLink*/ ctx[10].length === 1) return create_if_block_6;
    		if (/*splitLink*/ ctx[10].length === 2) return create_if_block_7;
    	}

    	let current_block_type = select_block_type_7(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(75:20) {#if (splitMatchContent[0] === 'L')}",
    		ctx
    	});

    	return block;
    }

    // (72:16) {#if (splitMatchContent[0] === 'O')}
    function create_if_block_4$1(ctx) {
    	let texthighlights;
    	let current;

    	texthighlights = new TextHighlight({
    			props: {
    				splitMatchContent: /*splitMatchContent*/ ctx[9]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(texthighlights.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(texthighlights, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(texthighlights.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(texthighlights.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(texthighlights, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(72:16) {#if (splitMatchContent[0] === 'O')}",
    		ctx
    	});

    	return block;
    }

    // (91:63) 
    function create_if_block_11(ctx) {
    	let a;
    	let sup;
    	let t0;
    	let t1_value = /*splitFootnote*/ ctx[11][1] + "";
    	let t1;
    	let t2;
    	let a_id_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			sup = element("sup");
    			t0 = text("[");
    			t1 = text(t1_value);
    			t2 = text("]");
    			add_location(sup, file$b, 93, 162, 5408);
    			attr_dev(a, "href", "#bottom_footnote_" + /*splitFootnote*/ ctx[11][1]);
    			attr_dev(a, "id", a_id_value = "" + (/*textFootnote*/ ctx[13][0] + "-" + (/*textFootnote*/ ctx[13][2] - /*countFootnote*/ ctx[14])));
    			attr_dev(a, "class", "footnote text_content svelte-c6mash");
    			add_location(a, file$b, 93, 28, 5274);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, sup);
    			append_dev(sup, t0);
    			append_dev(sup, t1);
    			append_dev(sup, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dictFootnotesText*/ 4 && a_id_value !== (a_id_value = "" + (/*textFootnote*/ ctx[13][0] + "-" + (/*textFootnote*/ ctx[13][2] - /*countFootnote*/ ctx[14])))) {
    				attr_dev(a, "id", a_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(91:63) ",
    		ctx
    	});

    	return block;
    }

    // (88:24) {#if (splitFootnote.length === 1)}
    function create_if_block_10(ctx) {
    	let a;
    	let sup;
    	let t0;
    	let t1_value = /*numberParagraph*/ ctx[12] + "";
    	let t1;
    	let t2;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			sup = element("sup");
    			t0 = text("[");
    			t1 = text(t1_value);
    			t2 = text("]");
    			add_location(sup, file$b, 89, 104, 4985);
    			attr_dev(a, "href", a_href_value = "#bottom_footnote_" + /*numberParagraph*/ ctx[12]);
    			attr_dev(a, "class", "footnote text_content svelte-c6mash");
    			add_location(a, file$b, 89, 28, 4909);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, sup);
    			append_dev(sup, t0);
    			append_dev(sup, t1);
    			append_dev(sup, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dictTextToFootnote*/ 2 && t1_value !== (t1_value = /*numberParagraph*/ ctx[12] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*dictTextToFootnote*/ 2 && a_href_value !== (a_href_value = "#bottom_footnote_" + /*numberParagraph*/ ctx[12])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(88:24) {#if (splitFootnote.length === 1)}",
    		ctx
    	});

    	return block;
    }

    // (80:59) 
    function create_if_block_7(ctx) {
    	let a;
    	let t_value = /*splitLink*/ ctx[10][1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", /*splitLink*/ ctx[10][0]);
    			attr_dev(a, "class", "text_content svelte-c6mash");
    			add_location(a, file$b, 80, 28, 4341);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(80:59) ",
    		ctx
    	});

    	return block;
    }

    // (78:24) {#if (splitLink.length === 1)}
    function create_if_block_6(ctx) {
    	let a;
    	let t_value = /*splitLink*/ ctx[10][0] + "";
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", /*splitLink*/ ctx[10][0]);
    			attr_dev(a, "class", "text_content svelte-c6mash");
    			add_location(a, file$b, 78, 28, 4188);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(78:24) {#if (splitLink.length === 1)}",
    		ctx
    	});

    	return block;
    }

    // (20:12) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let t0_value = /*content*/ ctx[5] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "text_content svelte-c6mash");
    			add_location(div, file$b, 20, 16, 640);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*splitContent*/ 1 && t0_value !== (t0_value = /*content*/ ctx[5] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(20:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:12) {#if (content === '')}
    function create_if_block_1$3(ctx) {
    	let div;
    	let br;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			br = element("br");
    			t = space();
    			add_location(br, file$b, 18, 43, 592);
    			attr_dev(div, "class", "text_content svelte-c6mash");
    			add_location(div, file$b, 18, 16, 565);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, br);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(18:12) {#if (content === '')}",
    		ctx
    	});

    	return block;
    }

    // (17:8) {#each splitContent.split('\n') as content}
    function create_each_block$2(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*content*/ ctx[5] === '') return create_if_block_1$3;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:8) {#each splitContent.split('\\n') as content}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$4, create_if_block_2$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*matchesContent*/ ctx[3].length === 0) return 0;
    		if (/*splitContent*/ ctx[0].length !== 0) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "contentdiv svelte-c6mash");
    			add_location(div, file$b, 14, 0, 372);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EachContent', slots, []);
    	let { splitContent = '' } = $$props;
    	let { dictTextToFootnote = {} } = $$props;
    	let { dictFootnotesText = {} } = $$props;
    	const matchesContent = [...splitContent.matchAll(/\[\[([^\[\]]*)\]\]/g)];
    	let fontsize = 14;
    	const writable_props = ['splitContent', 'dictTextToFootnote', 'dictFootnotesText'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EachContent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('splitContent' in $$props) $$invalidate(0, splitContent = $$props.splitContent);
    		if ('dictTextToFootnote' in $$props) $$invalidate(1, dictTextToFootnote = $$props.dictTextToFootnote);
    		if ('dictFootnotesText' in $$props) $$invalidate(2, dictFootnotesText = $$props.dictFootnotesText);
    	};

    	$$self.$capture_state = () => ({
    		TextHighlights: TextHighlight,
    		splitContent,
    		dictTextToFootnote,
    		dictFootnotesText,
    		matchesContent,
    		fontsize
    	});

    	$$self.$inject_state = $$props => {
    		if ('splitContent' in $$props) $$invalidate(0, splitContent = $$props.splitContent);
    		if ('dictTextToFootnote' in $$props) $$invalidate(1, dictTextToFootnote = $$props.dictTextToFootnote);
    		if ('dictFootnotesText' in $$props) $$invalidate(2, dictFootnotesText = $$props.dictFootnotesText);
    		if ('fontsize' in $$props) fontsize = $$props.fontsize;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [splitContent, dictTextToFootnote, dictFootnotesText, matchesContent];
    }

    class EachContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			splitContent: 0,
    			dictTextToFootnote: 1,
    			dictFootnotesText: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EachContent",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get splitContent() {
    		throw new Error("<EachContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set splitContent(value) {
    		throw new Error("<EachContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dictTextToFootnote() {
    		throw new Error("<EachContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dictTextToFootnote(value) {
    		throw new Error("<EachContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dictFootnotesText() {
    		throw new Error("<EachContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dictFootnotesText(value) {
    		throw new Error("<EachContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ParagraphContents.svelte generated by Svelte v3.59.2 */
    const file$a = "src/components/ParagraphContents.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (25:8) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let current;
    	let each_value_1 = /*splitContents*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(div, "display", "none");
    			add_location(div, file$a, 25, 12, 818);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*splitContents, dictFootnotesText, dictTextToFootnote*/ 28) {
    				each_value_1 = /*splitContents*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(25:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:8) {#if (dictVisible[countParagraph])}
    function create_if_block$3(ctx) {
    	let div;
    	let current;
    	let each_value = /*splitContents*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "style", "");
    			add_location(div, file$a, 17, 12, 464);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*splitContents, dictFootnotesText, dictTextToFootnote*/ 28) {
    				each_value = /*splitContents*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(17:8) {#if (dictVisible[countParagraph])}",
    		ctx
    	});

    	return block;
    }

    // (27:16) {#each splitContents as splitContent}
    function create_each_block_1$1(ctx) {
    	let eachcontent;
    	let current;

    	eachcontent = new EachContent({
    			props: {
    				splitContent: /*splitContent*/ ctx[6],
    				dictFootnotesText: /*dictFootnotesText*/ ctx[2],
    				dictTextToFootnote: /*dictTextToFootnote*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(eachcontent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(eachcontent, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const eachcontent_changes = {};
    			if (dirty & /*dictFootnotesText*/ 4) eachcontent_changes.dictFootnotesText = /*dictFootnotesText*/ ctx[2];
    			if (dirty & /*dictTextToFootnote*/ 8) eachcontent_changes.dictTextToFootnote = /*dictTextToFootnote*/ ctx[3];
    			eachcontent.$set(eachcontent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(eachcontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(eachcontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(eachcontent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(27:16) {#each splitContents as splitContent}",
    		ctx
    	});

    	return block;
    }

    // (19:16) {#each splitContents as splitContent}
    function create_each_block$1(ctx) {
    	let eachcontent;
    	let current;

    	eachcontent = new EachContent({
    			props: {
    				splitContent: /*splitContent*/ ctx[6],
    				dictFootnotesText: /*dictFootnotesText*/ ctx[2],
    				dictTextToFootnote: /*dictTextToFootnote*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(eachcontent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(eachcontent, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const eachcontent_changes = {};
    			if (dirty & /*dictFootnotesText*/ 4) eachcontent_changes.dictFootnotesText = /*dictFootnotesText*/ ctx[2];
    			if (dirty & /*dictTextToFootnote*/ 8) eachcontent_changes.dictTextToFootnote = /*dictTextToFootnote*/ ctx[3];
    			eachcontent.$set(eachcontent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(eachcontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(eachcontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(eachcontent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(19:16) {#each splitContents as splitContent}",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#key dictVisible}
    function create_key_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*dictVisible*/ ctx[1][/*countParagraph*/ ctx[0]]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(16:4) {#key dictVisible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let previous_key = /*dictVisible*/ ctx[1];
    	let div_class_value;
    	let current;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			key_block.c();
    			attr_dev(div, "class", div_class_value = "section_" + /*countParagraph*/ ctx[0]);
    			add_location(div, file$a, 14, 0, 346);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			key_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dictVisible*/ 2 && safe_not_equal(previous_key, previous_key = /*dictVisible*/ ctx[1])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block, 1);
    				key_block.m(div, null);
    			} else {
    				key_block.p(ctx, dirty);
    			}

    			if (!current || dirty & /*countParagraph*/ 1 && div_class_value !== (div_class_value = "section_" + /*countParagraph*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ParagraphContents', slots, []);
    	let { countParagraph = 0 } = $$props;
    	let { content = '' } = $$props;
    	let { dictVisible = {} } = $$props;
    	let { dictFootnotesText = {} } = $$props;
    	let { dictTextToFootnote = {} } = $$props;
    	const splitContents = content.split('\n');

    	const writable_props = [
    		'countParagraph',
    		'content',
    		'dictVisible',
    		'dictFootnotesText',
    		'dictTextToFootnote'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ParagraphContents> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('countParagraph' in $$props) $$invalidate(0, countParagraph = $$props.countParagraph);
    		if ('content' in $$props) $$invalidate(5, content = $$props.content);
    		if ('dictVisible' in $$props) $$invalidate(1, dictVisible = $$props.dictVisible);
    		if ('dictFootnotesText' in $$props) $$invalidate(2, dictFootnotesText = $$props.dictFootnotesText);
    		if ('dictTextToFootnote' in $$props) $$invalidate(3, dictTextToFootnote = $$props.dictTextToFootnote);
    	};

    	$$self.$capture_state = () => ({
    		EachContent,
    		countParagraph,
    		content,
    		dictVisible,
    		dictFootnotesText,
    		dictTextToFootnote,
    		splitContents
    	});

    	$$self.$inject_state = $$props => {
    		if ('countParagraph' in $$props) $$invalidate(0, countParagraph = $$props.countParagraph);
    		if ('content' in $$props) $$invalidate(5, content = $$props.content);
    		if ('dictVisible' in $$props) $$invalidate(1, dictVisible = $$props.dictVisible);
    		if ('dictFootnotesText' in $$props) $$invalidate(2, dictFootnotesText = $$props.dictFootnotesText);
    		if ('dictTextToFootnote' in $$props) $$invalidate(3, dictTextToFootnote = $$props.dictTextToFootnote);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		countParagraph,
    		dictVisible,
    		dictFootnotesText,
    		dictTextToFootnote,
    		splitContents,
    		content
    	];
    }

    class ParagraphContents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			countParagraph: 0,
    			content: 5,
    			dictVisible: 1,
    			dictFootnotesText: 2,
    			dictTextToFootnote: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ParagraphContents",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get countParagraph() {
    		throw new Error("<ParagraphContents>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set countParagraph(value) {
    		throw new Error("<ParagraphContents>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content() {
    		throw new Error("<ParagraphContents>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<ParagraphContents>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dictVisible() {
    		throw new Error("<ParagraphContents>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dictVisible(value) {
    		throw new Error("<ParagraphContents>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dictFootnotesText() {
    		throw new Error("<ParagraphContents>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dictFootnotesText(value) {
    		throw new Error("<ParagraphContents>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dictTextToFootnote() {
    		throw new Error("<ParagraphContents>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dictTextToFootnote(value) {
    		throw new Error("<ParagraphContents>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Home/Section.svelte generated by Svelte v3.59.2 */
    const file$9 = "src/components/Home/Section.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[27] = i;
    	return child_ctx;
    }

    function get_if_ctx(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*dictFootnotesText*/ child_ctx[2][/*footnote*/ child_ctx[21]][0];
    	child_ctx[24] = constants_0;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[33] = i;
    	const constants_0 = /*matchesParagraph*/ child_ctx[0][/*indexMatch*/ child_ctx[33]];
    	child_ctx[28] = constants_0;
    	const constants_1 = /*match*/ child_ctx[28][0].split(':')[0][3];
    	child_ctx[29] = constants_1;
    	const constants_2 = /*incrementParagraph*/ child_ctx[5]();
    	child_ctx[30] = constants_2;
    	const constants_3 = /*recordParagraph*/ child_ctx[6](/*numberParagraph*/ child_ctx[29]);
    	child_ctx[31] = constants_3;
    	return child_ctx;
    }

    function get_else_ctx(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*resetParagraph*/ child_ctx[7]();
    	child_ctx[19] = constants_0;
    	const constants_1 = /*matchesParagraph*/ child_ctx[0].length;
    	child_ctx[20] = constants_1;
    	return child_ctx;
    }

    // (112:4) {:else}
    function create_else_block$1(ctx) {
    	let t0;
    	let br0;
    	let t1;
    	let div;
    	let t2;
    	let br1;
    	let t3;
    	let each1_anchor;
    	let current;
    	let each_value_2 = { length: /*lengthMatches*/ ctx[20] };
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*listFootnotesText*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			br1 = element("br");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    			add_location(br0, file$9, 144, 8, 6876);
    			attr_dev(div, "class", "bottom_line svelte-lp9ras");
    			add_location(div, file$9, 145, 8, 6890);
    			add_location(br1, file$9, 146, 8, 6931);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*content, matchesParagraph, dictVisible, dictFootnotesText, dictTextToFootnote, recordParagraph, incrementParagraph, click_title*/ 383) {
    				each_value_2 = { length: /*lengthMatches*/ ctx[20] };
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(t0.parentNode, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*listFootnotesText, dictFootnotesText*/ 516) {
    				each_value = /*listFootnotesText*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each1_anchor.parentNode, each1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(112:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (109:4) {#if (matchesParagraph.length === 0)}
    function create_if_block$2(ctx) {
    	let eachcontent;
    	let current;

    	eachcontent = new EachContent({
    			props: {
    				splitContent: /*content*/ ctx[8],
    				dictTextToFootnote: /*dictTextToFootnote*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(eachcontent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(eachcontent, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const eachcontent_changes = {};
    			if (dirty[0] & /*dictTextToFootnote*/ 8) eachcontent_changes.dictTextToFootnote = /*dictTextToFootnote*/ ctx[3];
    			eachcontent.$set(eachcontent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(eachcontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(eachcontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(eachcontent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(109:4) {#if (matchesParagraph.length === 0)}",
    		ctx
    	});

    	return block;
    }

    // (124:48) 
    function create_if_block_5(ctx) {
    	let h4;
    	let ion_icon;
    	let a;
    	let t0_value = /*nowParagraphText*/ ctx[31] + "";
    	let t0;
    	let t1;
    	let span;
    	let t2;
    	let t3_value = /*match*/ ctx[28][1] + "";
    	let t3;
    	let h4_id_value;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[13](/*nowParagraphNum*/ ctx[30]);
    	}

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			ion_icon = element("ion-icon");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = text(".");
    			span = element("span");
    			t2 = text(" ");
    			t3 = text(t3_value);
    			set_custom_element_data(ion_icon, "name", "chevron-down-outline");
    			set_custom_element_data(ion_icon, "id", "down_arrow_" + /*nowParagraphNum*/ ctx[30]);
    			set_custom_element_data(ion_icon, "class", "down_arrow svelte-lp9ras");
    			add_location(ion_icon, file$9, 124, 49, 5665);
    			attr_dev(a, "href", "#index");
    			attr_dev(a, "id", "num_" + /*nowParagraphNum*/ ctx[30]);
    			attr_dev(a, "class", "svelte-lp9ras");
    			add_location(a, file$9, 124, 204, 5820);
    			attr_dev(span, "id", "headline_" + /*nowParagraphNum*/ ctx[30]);
    			attr_dev(span, "class", "headline svelte-lp9ras");
    			add_location(span, file$9, 124, 271, 5887);
    			attr_dev(h4, "id", h4_id_value = "para_" + /*nowParagraphText*/ ctx[31]);
    			attr_dev(h4, "class", "svelte-lp9ras");
    			add_location(h4, file$9, 124, 16, 5632);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			append_dev(h4, ion_icon);
    			append_dev(h4, a);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(h4, span);
    			append_dev(span, t2);
    			append_dev(span, t3);

    			if (!mounted) {
    				dispose = listen_dev(ion_icon, "click", click_handler_2, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*matchesParagraph*/ 1 && t0_value !== (t0_value = /*nowParagraphText*/ ctx[31] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*matchesParagraph*/ 1 && t3_value !== (t3_value = /*match*/ ctx[28][1] + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*matchesParagraph*/ 1 && h4_id_value !== (h4_id_value = "para_" + /*nowParagraphText*/ ctx[31])) {
    				attr_dev(h4, "id", h4_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(124:48) ",
    		ctx
    	});

    	return block;
    }

    // (122:48) 
    function create_if_block_4(ctx) {
    	let h3;
    	let ion_icon;
    	let a;
    	let t0_value = /*nowParagraphText*/ ctx[31] + "";
    	let t0;
    	let t1;
    	let span;
    	let t2;
    	let t3_value = /*match*/ ctx[28][1] + "";
    	let t3;
    	let h3_id_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[12](/*nowParagraphNum*/ ctx[30]);
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			ion_icon = element("ion-icon");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = text(".");
    			span = element("span");
    			t2 = text(" ");
    			t3 = text(t3_value);
    			set_custom_element_data(ion_icon, "name", "chevron-down-outline");
    			set_custom_element_data(ion_icon, "id", "down_arrow_" + /*nowParagraphNum*/ ctx[30]);
    			set_custom_element_data(ion_icon, "class", "down_arrow svelte-lp9ras");
    			add_location(ion_icon, file$9, 122, 49, 5259);
    			attr_dev(a, "href", "#index");
    			attr_dev(a, "id", "num_" + /*nowParagraphNum*/ ctx[30]);
    			attr_dev(a, "class", "svelte-lp9ras");
    			add_location(a, file$9, 122, 204, 5414);
    			attr_dev(span, "id", "headline_" + /*nowParagraphNum*/ ctx[30]);
    			attr_dev(span, "class", "headline svelte-lp9ras");
    			add_location(span, file$9, 122, 271, 5481);
    			attr_dev(h3, "id", h3_id_value = "para_" + /*nowParagraphText*/ ctx[31]);
    			attr_dev(h3, "class", "svelte-lp9ras");
    			add_location(h3, file$9, 122, 16, 5226);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, ion_icon);
    			append_dev(h3, a);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(h3, span);
    			append_dev(span, t2);
    			append_dev(span, t3);

    			if (!mounted) {
    				dispose = listen_dev(ion_icon, "click", click_handler_1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*matchesParagraph*/ 1 && t0_value !== (t0_value = /*nowParagraphText*/ ctx[31] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*matchesParagraph*/ 1 && t3_value !== (t3_value = /*match*/ ctx[28][1] + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*matchesParagraph*/ 1 && h3_id_value !== (h3_id_value = "para_" + /*nowParagraphText*/ ctx[31])) {
    				attr_dev(h3, "id", h3_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(122:48) ",
    		ctx
    	});

    	return block;
    }

    // (120:12) {#if (numberParagraph === '2')}
    function create_if_block_3(ctx) {
    	let h2;
    	let ion_icon;
    	let a;
    	let t0_value = /*nowParagraphText*/ ctx[31] + "";
    	let t0;
    	let t1;
    	let span;
    	let t2;
    	let t3_value = /*match*/ ctx[28][1] + "";
    	let t3;
    	let h2_id_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[11](/*nowParagraphNum*/ ctx[30]);
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			ion_icon = element("ion-icon");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = text(".");
    			span = element("span");
    			t2 = text(" ");
    			t3 = text(t3_value);
    			set_custom_element_data(ion_icon, "name", "chevron-down-outline");
    			set_custom_element_data(ion_icon, "id", "down_arrow_" + /*nowParagraphNum*/ ctx[30]);
    			set_custom_element_data(ion_icon, "class", "down_arrow svelte-lp9ras");
    			add_location(ion_icon, file$9, 120, 69, 4853);
    			attr_dev(a, "href", "#index");
    			attr_dev(a, "id", "num_" + /*nowParagraphNum*/ ctx[30]);
    			attr_dev(a, "class", "svelte-lp9ras");
    			add_location(a, file$9, 120, 224, 5008);
    			attr_dev(span, "id", "headline_" + /*nowParagraphNum*/ ctx[30]);
    			attr_dev(span, "class", "headline svelte-lp9ras");
    			add_location(span, file$9, 120, 291, 5075);
    			attr_dev(h2, "id", h2_id_value = "para_" + /*nowParagraphText*/ ctx[31]);
    			attr_dev(h2, "class", "bottom_line svelte-lp9ras");
    			add_location(h2, file$9, 120, 16, 4800);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, ion_icon);
    			append_dev(h2, a);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(h2, span);
    			append_dev(span, t2);
    			append_dev(span, t3);

    			if (!mounted) {
    				dispose = listen_dev(ion_icon, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*matchesParagraph*/ 1 && t0_value !== (t0_value = /*nowParagraphText*/ ctx[31] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*matchesParagraph*/ 1 && t3_value !== (t3_value = /*match*/ ctx[28][1] + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*matchesParagraph*/ 1 && h2_id_value !== (h2_id_value = "para_" + /*nowParagraphText*/ ctx[31])) {
    				attr_dev(h2, "id", h2_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(120:12) {#if (numberParagraph === '2')}",
    		ctx
    	});

    	return block;
    }

    // (135:12) {:else}
    function create_else_block_2(ctx) {
    	let paragraphcontents;
    	let current;

    	paragraphcontents = new ParagraphContents({
    			props: {
    				content: /*content*/ ctx[8].slice(/*match*/ ctx[28].index + /*match*/ ctx[28][0].length, /*matchesParagraph*/ ctx[0][/*indexMatch*/ ctx[33] + 1].index),
    				countParagraph: /*indexMatch*/ ctx[33] + 1,
    				dictVisible: /*dictVisible*/ ctx[1],
    				dictFootnotesText: /*dictFootnotesText*/ ctx[2],
    				dictTextToFootnote: /*dictTextToFootnote*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paragraphcontents.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paragraphcontents, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paragraphcontents_changes = {};
    			if (dirty[0] & /*matchesParagraph*/ 1) paragraphcontents_changes.content = /*content*/ ctx[8].slice(/*match*/ ctx[28].index + /*match*/ ctx[28][0].length, /*matchesParagraph*/ ctx[0][/*indexMatch*/ ctx[33] + 1].index);
    			if (dirty[0] & /*dictVisible*/ 2) paragraphcontents_changes.dictVisible = /*dictVisible*/ ctx[1];
    			if (dirty[0] & /*dictFootnotesText*/ 4) paragraphcontents_changes.dictFootnotesText = /*dictFootnotesText*/ ctx[2];
    			if (dirty[0] & /*dictTextToFootnote*/ 8) paragraphcontents_changes.dictTextToFootnote = /*dictTextToFootnote*/ ctx[3];
    			paragraphcontents.$set(paragraphcontents_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paragraphcontents.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paragraphcontents.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paragraphcontents, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(135:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (128:12) {#if (indexMatch === lengthMatches-1)}
    function create_if_block_2(ctx) {
    	let paragraphcontents;
    	let current;

    	paragraphcontents = new ParagraphContents({
    			props: {
    				content: /*content*/ ctx[8].slice(/*match*/ ctx[28].index + /*match*/ ctx[28][0].length),
    				countParagraph: /*indexMatch*/ ctx[33] + 1,
    				dictVisible: /*dictVisible*/ ctx[1],
    				dictFootnotesText: /*dictFootnotesText*/ ctx[2],
    				dictTextToFootnote: /*dictTextToFootnote*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(paragraphcontents.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paragraphcontents, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paragraphcontents_changes = {};
    			if (dirty[0] & /*matchesParagraph*/ 1) paragraphcontents_changes.content = /*content*/ ctx[8].slice(/*match*/ ctx[28].index + /*match*/ ctx[28][0].length);
    			if (dirty[0] & /*dictVisible*/ 2) paragraphcontents_changes.dictVisible = /*dictVisible*/ ctx[1];
    			if (dirty[0] & /*dictFootnotesText*/ 4) paragraphcontents_changes.dictFootnotesText = /*dictFootnotesText*/ ctx[2];
    			if (dirty[0] & /*dictTextToFootnote*/ 8) paragraphcontents_changes.dictTextToFootnote = /*dictTextToFootnote*/ ctx[3];
    			paragraphcontents.$set(paragraphcontents_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paragraphcontents.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paragraphcontents.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paragraphcontents, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(128:12) {#if (indexMatch === lengthMatches-1)}",
    		ctx
    	});

    	return block;
    }

    // (115:8) {#each {length: lengthMatches} as _, indexMatch}
    function create_each_block_2(ctx) {
    	let t;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;

    	function select_block_type_1(ctx, dirty) {
    		if (/*numberParagraph*/ ctx[29] === '2') return create_if_block_3;
    		if (/*numberParagraph*/ ctx[29] === '3') return create_if_block_4;
    		if (/*numberParagraph*/ ctx[29] === '4') return create_if_block_5;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	const if_block_creators = [create_if_block_2, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*indexMatch*/ ctx[33] === /*lengthMatches*/ ctx[20] - 1) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) {
    				if_block0.d(detaching);
    			}

    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(115:8) {#each {length: lengthMatches} as _, indexMatch}",
    		ctx
    	});

    	return block;
    }

    // (159:12) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let a;
    	let t0;
    	let t1_value = /*footnote*/ ctx[21] + "";
    	let t1;
    	let t2;
    	let t3;
    	let span;
    	let t4;
    	let t5_value = /*dictFootnotesText*/ ctx[2][/*footnote*/ ctx[21]] + "";
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t0 = text("[");
    			t1 = text(t1_value);
    			t2 = text("]");
    			t3 = space();
    			span = element("span");
    			t4 = text(" ");
    			t5 = text(t5_value);
    			t6 = space();
    			attr_dev(a, "href", "#" + /*footnote*/ ctx[21]);
    			attr_dev(a, "class", "footnote svelte-lp9ras");
    			add_location(a, file$9, 160, 20, 7623);
    			attr_dev(span, "class", "svelte-lp9ras");
    			add_location(span, file$9, 161, 20, 7700);
    			attr_dev(div, "id", "bottom_footnote_" + /*footnote*/ ctx[21]);
    			attr_dev(div, "class", "svelte-lp9ras");
    			add_location(div, file$9, 159, 16, 7564);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    			append_dev(div, t3);
    			append_dev(div, span);
    			append_dev(span, t4);
    			append_dev(span, t5);
    			append_dev(div, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*dictFootnotesText*/ 4 && t5_value !== (t5_value = /*dictFootnotesText*/ ctx[2][/*footnote*/ ctx[21]] + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(159:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (150:12) {#if isNaN(footnote)}
    function create_if_block_1$2(ctx) {
    	let div;
    	let span0;
    	let t0;
    	let t1_value = /*footnote*/ ctx[21] + "";
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let span1;
    	let t5_value = /*dictFootnotesText*/ ctx[2][/*footnote*/ ctx[21]][3] + "";
    	let t5;
    	let t6;

    	let each_value_1 = {
    		length: /*dictFootnotesText*/ ctx[2][/*footnote*/ ctx[21]][2]
    	};

    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text("[");
    			t1 = text(t1_value);
    			t2 = text("]");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			span1 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			attr_dev(span0, "class", "svelte-lp9ras");
    			add_location(span0, file$9, 152, 20, 7170);
    			attr_dev(span1, "class", "svelte-lp9ras");
    			add_location(span1, file$9, 156, 20, 7456);
    			attr_dev(div, "id", "bottom_footnote_" + /*footnote*/ ctx[21]);
    			attr_dev(div, "class", "svelte-lp9ras");
    			add_location(div, file$9, 151, 16, 7111);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(span0, t2);
    			append_dev(div, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			append_dev(div, t4);
    			append_dev(div, span1);
    			append_dev(span1, t5);
    			append_dev(div, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*dictFootnotesText, listFootnotesText*/ 516) {
    				each_value_1 = {
    					length: /*dictFootnotesText*/ ctx[2][/*footnote*/ ctx[21]][2]
    				};

    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*dictFootnotesText*/ 4 && t5_value !== (t5_value = /*dictFootnotesText*/ ctx[2][/*footnote*/ ctx[21]][3] + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(150:12) {#if isNaN(footnote)}",
    		ctx
    	});

    	return block;
    }

    // (154:20) {#each {length: dictFootnotesText[footnote][2]} as _, index}
    function create_each_block_1(ctx) {
    	let sup;
    	let a;
    	let t0_value = /*numberFootnote*/ ctx[24] + "";
    	let t0;
    	let t1;
    	let t2_value = /*index*/ ctx[27] + 1 + "";
    	let t2;
    	let t3;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			sup = element("sup");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = text(t2_value);
    			t3 = text(" ");
    			attr_dev(a, "href", a_href_value = "#" + /*numberFootnote*/ ctx[24] + "-" + (/*index*/ ctx[27] + 1));
    			attr_dev(a, "class", "footnote svelte-lp9ras");
    			add_location(a, file$9, 154, 29, 7308);
    			attr_dev(sup, "class", "svelte-lp9ras");
    			add_location(sup, file$9, 154, 24, 7303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, sup, anchor);
    			append_dev(sup, a);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    			append_dev(a, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*dictFootnotesText*/ 4 && t0_value !== (t0_value = /*numberFootnote*/ ctx[24] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*dictFootnotesText*/ 4 && a_href_value !== (a_href_value = "#" + /*numberFootnote*/ ctx[24] + "-" + (/*index*/ ctx[27] + 1))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(sup);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(154:20) {#each {length: dictFootnotesText[footnote][2]} as _, index}",
    		ctx
    	});

    	return block;
    }

    // (149:8) {#each listFootnotesText as footnote}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_3(ctx, dirty) {
    		if (isNaN(/*footnote*/ ctx[21])) return create_if_block_1$2;
    		return create_else_block_1;
    	}

    	function select_block_ctx(ctx, type) {
    		if (type === create_if_block_1$2) return get_if_ctx(ctx);
    		return ctx;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(select_block_ctx(ctx, current_block_type));

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(select_block_ctx(ctx, current_block_type), dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(149:8) {#each listFootnotesText as footnote}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let section;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*matchesParagraph*/ ctx[0].length === 0) return 0;
    		return 1;
    	}

    	function select_block_ctx(ctx, index) {
    		if (index === 1) return get_else_ctx(ctx);
    		return ctx;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](select_block_ctx(ctx, current_block_type_index));

    	const block = {
    		c: function create() {
    			section = element("section");
    			if_block.c();
    			attr_dev(section, "class", "svelte-lp9ras");
    			add_location(section, file$9, 107, 0, 4152);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_blocks[current_block_type_index].m(section, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(select_block_ctx(ctx, current_block_type_index), dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](select_block_ctx(ctx, current_block_type_index));
    					if_block.c();
    				} else {
    					if_block.p(select_block_ctx(ctx, current_block_type_index), dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(section, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Section', slots, []);
    	let { writeOutput = {} } = $$props;
    	let { matchesParagraph = [] } = $$props;

    	function click_title(n) {
    		const headline_string = "headline_" + n;
    		const down_arrow_string = "down_arrow_" + n;
    		const num_string = "num_" + n;

    		// const section_string = "section_" + n;
    		// if(document.getElementById(down_arrow_string).name === "chevron-forward-outline") {
    		if (dictVisible[n] === false) {
    			$$invalidate(1, dictVisible[n] = true, dictVisible);
    			document.getElementById(headline_string).style.color = "black";
    			document.getElementById(down_arrow_string).style.color = "black";
    			document.getElementById(down_arrow_string).name = "chevron-down-outline";
    			document.getElementById(num_string).style.color = "#0275d8";
    		} else {
    			$$invalidate(1, dictVisible[n] = false, dictVisible); // document.getElementById(section_string).style.display = "block";
    			document.getElementById(headline_string).style.color = "#b3b3b3";
    			document.getElementById(down_arrow_string).style.color = "#b3b3b3";
    			document.getElementById(down_arrow_string).name = "chevron-forward-outline";
    			document.getElementById(num_string).style.color = "#80BAEB";
    		} // document.getElementById(section_string).style.display = "none";
    	}

    	const makeFinalHtml = (indexMatch, line, match, matches, nowGetParagraphNum) => {
    		if (indexMatch === matches.length - 1) return `<span class=\"section_${nowGetParagraphNum}\">${line.slice(match.index + match[0].length)}</span>`; else return `<span class="section_${nowGetParagraphNum}"></span>`;
    	};

    	let countParagraph = 0;
    	let textParagraph = [0, 0, 0];

    	// const getParagraph = () => {return countParagraph;}
    	const incrementParagraph = () => {
    		return ++countParagraph;
    	};

    	const recordParagraph = num => {
    		switch (num) {
    			case '2':
    				textParagraph[1] = textParagraph[2] = 0;
    				return `${++textParagraph[0]}`;
    			case '3':
    				textParagraph[2] = 0;
    				return `${textParagraph[0]}-${++textParagraph[1]}`;
    			default:
    				// 4 and more
    				return `${textParagraph[0]}-${textParagraph[1]}-${++textParagraph[2]}`;
    		}
    	};

    	const resetParagraph = () => {
    		countParagraph = 0;
    		textParagraph = [0, 0, 0];
    		return true;
    	};

    	const content = writeOutput.data.content;

    	// const matches = [...content.matchAll(/\[\[H[2-4]:([^\[\]]*)\]\]/g)]
    	let dictVisible = {};

    	for (let match of Array(matchesParagraph.length).keys()) {
    		dictVisible[match + 1] = true;
    	}

    	const matchesFootnotes = [...content.matchAll(/\[\[F:([^\[\]]*)\]\]/g)];

    	let dictFootnotesText = {}; // TODO: 이거 해결 어떻게 해야 본문에 넣을까?
    	// 글자: [숫자, 남은갯수, 갯수, 텍스트] <- 글자인 경우 첫번째 텍스트만 반영
    	// 숫자: 텍스트

    	let dictTextToFootnote = {}; // 텍스트: 숫자/텍스트
    	let listFootnotesText = []; // 그냥 인덱스 순서대로 글자/숫자
    	let countFootnote = 0;

    	for (let match of matchesFootnotes) {
    		const splitMatch = match[1].split('|');

    		if (splitMatch.length === 1) {
    			countFootnote++;
    			dictFootnotesText[countFootnote] = match[1];
    			listFootnotesText.push(countFootnote);
    			dictTextToFootnote[match[1]] = countFootnote;
    		} else if (splitMatch.length === 2) {
    			if (dictFootnotesText[splitMatch[1]] === undefined) {
    				listFootnotesText.push(splitMatch[1]);
    				dictFootnotesText[splitMatch[1]] = [++countFootnote, 1, 1, splitMatch[0]];
    				dictTextToFootnote[splitMatch[0]] = countFootnote;
    			} else {
    				dictFootnotesText[splitMatch[1]][1]++;
    				dictFootnotesText[splitMatch[1]][2]++;
    			}
    		}
    	}

    	const writable_props = ['writeOutput', 'matchesParagraph'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	const click_handler = nowParagraphNum => click_title(`${nowParagraphNum}`);
    	const click_handler_1 = nowParagraphNum => click_title(`${nowParagraphNum}`);
    	const click_handler_2 = nowParagraphNum => click_title(`${nowParagraphNum}`);

    	$$self.$$set = $$props => {
    		if ('writeOutput' in $$props) $$invalidate(10, writeOutput = $$props.writeOutput);
    		if ('matchesParagraph' in $$props) $$invalidate(0, matchesParagraph = $$props.matchesParagraph);
    	};

    	$$self.$capture_state = () => ({
    		ParagraphContents,
    		EachContent,
    		writeOutput,
    		matchesParagraph,
    		click_title,
    		makeFinalHtml,
    		countParagraph,
    		textParagraph,
    		incrementParagraph,
    		recordParagraph,
    		resetParagraph,
    		content,
    		dictVisible,
    		matchesFootnotes,
    		dictFootnotesText,
    		dictTextToFootnote,
    		listFootnotesText,
    		countFootnote
    	});

    	$$self.$inject_state = $$props => {
    		if ('writeOutput' in $$props) $$invalidate(10, writeOutput = $$props.writeOutput);
    		if ('matchesParagraph' in $$props) $$invalidate(0, matchesParagraph = $$props.matchesParagraph);
    		if ('countParagraph' in $$props) countParagraph = $$props.countParagraph;
    		if ('textParagraph' in $$props) textParagraph = $$props.textParagraph;
    		if ('dictVisible' in $$props) $$invalidate(1, dictVisible = $$props.dictVisible);
    		if ('dictFootnotesText' in $$props) $$invalidate(2, dictFootnotesText = $$props.dictFootnotesText);
    		if ('dictTextToFootnote' in $$props) $$invalidate(3, dictTextToFootnote = $$props.dictTextToFootnote);
    		if ('listFootnotesText' in $$props) $$invalidate(9, listFootnotesText = $$props.listFootnotesText);
    		if ('countFootnote' in $$props) countFootnote = $$props.countFootnote;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		matchesParagraph,
    		dictVisible,
    		dictFootnotesText,
    		dictTextToFootnote,
    		click_title,
    		incrementParagraph,
    		recordParagraph,
    		resetParagraph,
    		content,
    		listFootnotesText,
    		writeOutput,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { writeOutput: 10, matchesParagraph: 0 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get writeOutput() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set writeOutput(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get matchesParagraph() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set matchesParagraph(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Search_bar.svelte generated by Svelte v3.59.2 */

    const { console: console_1$3 } = globals;
    const file$8 = "src/components/Search_bar.svelte";

    // (34:4) {#if (UserOutput.success)}
    function create_if_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*UserOutput*/ ctx[0].data.authority <= minAuthority && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*UserOutput*/ ctx[0].data.authority <= minAuthority) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(34:4) {#if (UserOutput.success)}",
    		ctx
    	});

    	return block;
    }

    // (35:8) {#if (UserOutput.data.authority <= minAuthority)}
    function create_if_block_1$1(ctx) {
    	let a;
    	let ion_icon;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			ion_icon = element("ion-icon");
    			set_custom_element_data(ion_icon, "name", "skull-outline");
    			set_custom_element_data(ion_icon, "class", "svelte-15vljcn");
    			add_location(ion_icon, file$8, 35, 54, 3088);
    			attr_dev(a, "class", "hidden svelte-15vljcn");
    			add_location(a, file$8, 35, 12, 3046);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, ion_icon);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*changeHidden*/ ctx[3], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(35:8) {#if (UserOutput.data.authority <= minAuthority)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div2;
    	let div1;
    	let a0;
    	let svg0;
    	let path0;
    	let t0;
    	let form;
    	let input;
    	let t1;
    	let a1;
    	let svg1;
    	let path1;
    	let a1_href_value;
    	let t2;
    	let a2;
    	let svg2;
    	let path2;
    	let a2_href_value;
    	let t3;
    	let div0;
    	let a3;
    	let svg3;
    	let path3;
    	let t4;
    	let mounted;
    	let dispose;
    	let if_block = /*UserOutput*/ ctx[0].success && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			form = element("form");
    			input = element("input");
    			t1 = space();
    			a1 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t2 = space();
    			a2 = element("a");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t3 = space();
    			div0 = element("div");
    			a3 = element("a");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			t4 = space();
    			if (if_block) if_block.c();
    			attr_dev(path0, "d", "M403.8 34.4c12-5 25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V160H352c-10.1 0-19.6 4.7-25.6 12.8L284 229.3 244 176l31.2-41.6C293.3 110.2 321.8 96 352 96h32V64c0-12.9 7.8-24.6 19.8-29.6zM164 282.7L204 336l-31.2 41.6C154.7 401.8 126.2 416 96 416H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H96c10.1 0 19.6-4.7 25.6-12.8L164 282.7zm274.6 188c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V416H352c-30.2 0-58.7-14.2-76.8-38.4L121.6 172.8c-6-8.1-15.5-12.8-25.6-12.8H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H96c30.2 0 58.7 14.2 76.8 38.4L326.4 339.2c6 8.1 15.5 12.8 25.6 12.8h32V320c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64z");
    			attr_dev(path0, "class", "svelte-15vljcn");
    			add_location(path0, file$8, 23, 151, 601);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "id", "random_icon");
    			attr_dev(svg0, "data-v-3070b92f", "");
    			attr_dev(svg0, "class", "svelte-15vljcn");
    			add_location(svg0, file$8, 23, 53, 503);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "title", "아무 문서로 이동");
    			attr_dev(a0, "class", "random svelte-15vljcn");
    			add_location(a0, file$8, 23, 8, 458);
    			attr_dev(input, "type", "search");
    			attr_dev(input, "placeholder", "여기에서 검색");
    			attr_dev(input, "autocomplete", "off");
    			attr_dev(input, "spellcheck", "false");
    			attr_dev(input, "tabindex", "1");
    			attr_dev(input, "id", "search_place");
    			attr_dev(input, "data-v-3070b92f", "");
    			attr_dev(input, "class", "svelte-15vljcn");
    			add_location(input, file$8, 25, 12, 1461);
    			attr_dev(path1, "d", "M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z");
    			attr_dev(path1, "class", "svelte-15vljcn");
    			add_location(path1, file$8, 26, 175, 1793);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "height", "1em");
    			attr_dev(svg1, "viewBox", "0 0 512 512");
    			attr_dev(svg1, "id", "random_icon");
    			attr_dev(svg1, "data-v-3070b92f", "");
    			attr_dev(svg1, "class", "svelte-15vljcn");
    			add_location(svg1, file$8, 26, 64, 1682);
    			attr_dev(a1, "href", a1_href_value = "/w/" + /*searchLink*/ ctx[1]);
    			attr_dev(a1, "title", "검색");
    			attr_dev(a1, "class", "random svelte-15vljcn");
    			add_location(a1, file$8, 26, 12, 1630);
    			attr_dev(path2, "d", "M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z");
    			attr_dev(path2, "class", "svelte-15vljcn");
    			add_location(path2, file$8, 27, 175, 2230);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "height", "1em");
    			attr_dev(svg2, "viewBox", "0 0 448 512");
    			attr_dev(svg2, "id", "random_icon");
    			attr_dev(svg2, "data-v-3070b92f", "");
    			attr_dev(svg2, "class", "svelte-15vljcn");
    			add_location(svg2, file$8, 27, 64, 2119);
    			attr_dev(a2, "href", a2_href_value = "/w/" + /*searchLink*/ ctx[1]);
    			attr_dev(a2, "title", "이동");
    			attr_dev(a2, "class", "random svelte-15vljcn");
    			add_location(a2, file$8, 27, 12, 2067);
    			attr_dev(form, "class", "search_bar svelte-15vljcn");
    			add_location(form, file$8, 24, 8, 1384);
    			attr_dev(path3, "d", "M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z");
    			attr_dev(path3, "class", "svelte-15vljcn");
    			add_location(path3, file$8, 30, 180, 2706);
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "height", "1em");
    			attr_dev(svg3, "viewBox", "0 0 448 512");
    			attr_dev(svg3, "id", "profile_icon");
    			attr_dev(svg3, "data-v-c0860ca0", "");
    			attr_dev(svg3, "data-v-76d6fdf5", "");
    			attr_dev(svg3, "class", "svelte-15vljcn");
    			add_location(svg3, file$8, 30, 49, 2575);
    			attr_dev(a3, "href", "/login");
    			attr_dev(a3, "id", "profile_button");
    			attr_dev(a3, "class", "svelte-15vljcn");
    			add_location(a3, file$8, 30, 12, 2538);
    			attr_dev(div0, "id", "profile");
    			attr_dev(div0, "class", "svelte-15vljcn");
    			add_location(div0, file$8, 29, 8, 2506);
    			attr_dev(div1, "id", "search_tool");
    			attr_dev(div1, "class", "svelte-15vljcn");
    			add_location(div1, file$8, 22, 4, 426);
    			attr_dev(div2, "id", "tool_bar");
    			attr_dev(div2, "class", "svelte-15vljcn");
    			add_location(div2, file$8, 21, 0, 401);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div1, t0);
    			append_dev(div1, form);
    			append_dev(form, input);
    			set_input_value(input, /*searchLink*/ ctx[1]);
    			append_dev(form, t1);
    			append_dev(form, a1);
    			append_dev(a1, svg1);
    			append_dev(svg1, path1);
    			append_dev(form, t2);
    			append_dev(form, a2);
    			append_dev(a2, svg2);
    			append_dev(svg2, path2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, a3);
    			append_dev(a3, svg3);
    			append_dev(svg3, path3);
    			append_dev(div2, t4);
    			if (if_block) if_block.m(div2, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(form, "submit", prevent_default(/*gotoLink*/ ctx[2]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*searchLink*/ 2 && input.value !== /*searchLink*/ ctx[1]) {
    				set_input_value(input, /*searchLink*/ ctx[1]);
    			}

    			if (dirty & /*searchLink*/ 2 && a1_href_value !== (a1_href_value = "/w/" + /*searchLink*/ ctx[1])) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*searchLink*/ 2 && a2_href_value !== (a2_href_value = "/w/" + /*searchLink*/ ctx[1])) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (/*UserOutput*/ ctx[0].success) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const minAuthority = 2;

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Search_bar', slots, []);
    	let { UserOutput = { data: { authority: 999 } } } = $$props;
    	let searchLink = '';

    	const gotoLink = () => {
    		console.log(searchLink);
    		window.location.href = "/w/" + searchLink;
    	};

    	let { hidden = false } = $$props;

    	const changeHidden = () => {
    		$$invalidate(4, hidden = !hidden);
    	};

    	const writable_props = ['UserOutput', 'hidden'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Search_bar> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchLink = this.value;
    		$$invalidate(1, searchLink);
    	}

    	$$self.$$set = $$props => {
    		if ('UserOutput' in $$props) $$invalidate(0, UserOutput = $$props.UserOutput);
    		if ('hidden' in $$props) $$invalidate(4, hidden = $$props.hidden);
    	};

    	$$self.$capture_state = () => ({
    		UserOutput,
    		minAuthority,
    		searchLink,
    		gotoLink,
    		hidden,
    		changeHidden
    	});

    	$$self.$inject_state = $$props => {
    		if ('UserOutput' in $$props) $$invalidate(0, UserOutput = $$props.UserOutput);
    		if ('searchLink' in $$props) $$invalidate(1, searchLink = $$props.searchLink);
    		if ('hidden' in $$props) $$invalidate(4, hidden = $$props.hidden);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [UserOutput, searchLink, gotoLink, changeHidden, hidden, input_input_handler];
    }

    class Search_bar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { UserOutput: 0, hidden: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search_bar",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get UserOutput() {
    		throw new Error("<Search_bar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set UserOutput(value) {
    		throw new Error("<Search_bar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hidden() {
    		throw new Error("<Search_bar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hidden(value) {
    		throw new Error("<Search_bar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Home.svelte generated by Svelte v3.59.2 */

    const { console: console_1$2 } = globals;
    const file$7 = "src/routes/Home.svelte";

    function get_then_context(ctx) {
    	const constants_0 = [.../*writeOutput*/ ctx[8].data.content.matchAll(/\[\[H[2-4]:([^\[\]]*)\]\]/g)];
    	ctx[10] = constants_0;
    }

    // (1:0) <script>  import Header from '../components/Home/Header.svelte'  import Nav from '../components/Home/Nav.svelte'  import Aside from '../components/Home/Aside.svelte';  import Footer from '../components/Home/Footer.svelte';  import Section from '../components/Home/Section.svelte';  import Search_bar from './../components/Search_bar.svelte';   export let path = undefined;  let hiddenButton = false;  let temp;   if (path === '') { window.location.href = "/"; }
    function create_catch_block_2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_2.name,
    		type: "catch",
    		source: "(1:0) <script>  import Header from '../components/Home/Header.svelte'  import Nav from '../components/Home/Nav.svelte'  import Aside from '../components/Home/Aside.svelte';  import Footer from '../components/Home/Footer.svelte';  import Section from '../components/Home/Section.svelte';  import Search_bar from './../components/Search_bar.svelte';   export let path = undefined;  let hiddenButton = false;  let temp;   if (path === '') { window.location.href = \\\"/\\\"; }",
    		ctx
    	});

    	return block;
    }

    // (41:1) {:then UserOutput}
    function create_then_block_2(ctx) {
    	let search_bar;
    	let updating_hidden;
    	let current;

    	function search_bar_hidden_binding(value) {
    		/*search_bar_hidden_binding*/ ctx[4](value);
    	}

    	let search_bar_props = { UserOutput: /*UserOutput*/ ctx[9] };

    	if (/*hiddenButton*/ ctx[1] !== void 0) {
    		search_bar_props.hidden = /*hiddenButton*/ ctx[1];
    	}

    	search_bar = new Search_bar({ props: search_bar_props, $$inline: true });
    	binding_callbacks.push(() => bind(search_bar, 'hidden', search_bar_hidden_binding));

    	const block = {
    		c: function create() {
    			create_component(search_bar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(search_bar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const search_bar_changes = {};

    			if (!updating_hidden && dirty & /*hiddenButton*/ 2) {
    				updating_hidden = true;
    				search_bar_changes.hidden = /*hiddenButton*/ ctx[1];
    				add_flush_callback(() => updating_hidden = false);
    			}

    			search_bar.$set(search_bar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search_bar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search_bar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(search_bar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_2.name,
    		type: "then",
    		source: "(41:1) {:then UserOutput}",
    		ctx
    	});

    	return block;
    }

    // (39:27)    <div></div>  {:then UserOutput}
    function create_pending_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "svelte-1bps8dd");
    			add_location(div, file$7, 39, 2, 1087);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_2.name,
    		type: "pending",
    		source: "(39:27)    <div></div>  {:then UserOutput}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>  import Header from '../components/Home/Header.svelte'  import Nav from '../components/Home/Nav.svelte'  import Aside from '../components/Home/Aside.svelte';  import Footer from '../components/Home/Footer.svelte';  import Section from '../components/Home/Section.svelte';  import Search_bar from './../components/Search_bar.svelte';   export let path = undefined;  let hiddenButton = false;  let temp;   if (path === '') { window.location.href = "/"; }
    function create_catch_block_1$1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1$1.name,
    		type: "catch",
    		source: "(1:0) <script>  import Header from '../components/Home/Header.svelte'  import Nav from '../components/Home/Nav.svelte'  import Aside from '../components/Home/Aside.svelte';  import Footer from '../components/Home/Footer.svelte';  import Section from '../components/Home/Section.svelte';  import Search_bar from './../components/Search_bar.svelte';   export let path = undefined;  let hiddenButton = false;  let temp;   if (path === '') { window.location.href = \\\"/\\\"; }",
    		ctx
    	});

    	return block;
    }

    // (47:2) {:then writeOutput}
    function create_then_block$1(ctx) {
    	let await_block_anchor;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_1$1,
    		then: create_then_block_1$1,
    		catch: create_catch_block$1,
    		value: 9,
    		blocks: [,,,]
    	};

    	handle_promise(/*UserOutputPromise*/ ctx[3], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(47:2) {:then writeOutput}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>  import Header from '../components/Home/Header.svelte'  import Nav from '../components/Home/Nav.svelte'  import Aside from '../components/Home/Aside.svelte';  import Footer from '../components/Home/Footer.svelte';  import Section from '../components/Home/Section.svelte';  import Search_bar from './../components/Search_bar.svelte';   export let path = undefined;  let hiddenButton = false;  let temp;   if (path === '') { window.location.href = "/"; }
    function create_catch_block$1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script>  import Header from '../components/Home/Header.svelte'  import Nav from '../components/Home/Nav.svelte'  import Aside from '../components/Home/Aside.svelte';  import Footer from '../components/Home/Footer.svelte';  import Section from '../components/Home/Section.svelte';  import Search_bar from './../components/Search_bar.svelte';   export let path = undefined;  let hiddenButton = false;  let temp;   if (path === '') { window.location.href = \\\"/\\\"; }",
    		ctx
    	});

    	return block;
    }

    // (50:3) {:then UserOutput}
    function create_then_block_1$1(ctx) {
    	get_then_context(ctx);
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*writeOutput*/ ctx[8].success) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			get_then_context(ctx);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1$1.name,
    		type: "then",
    		source: "(50:3) {:then UserOutput}",
    		ctx
    	});

    	return block;
    }

    // (61:4) {:else}
    function create_else_block(ctx) {
    	let header;
    	let t;
    	let section;
    	let current;

    	header = new Header({
    			props: {
    				path: /*path*/ ctx[0],
    				writeOutput: /*writeOutput*/ ctx[8],
    				UserOutput: /*UserOutput*/ ctx[9]
    			},
    			$$inline: true
    		});

    	section = new Section({
    			props: {
    				writeOutput: /*writeOutput*/ ctx[8],
    				matchesParagraph: /*matchesParagraph*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(section.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};
    			if (dirty & /*path*/ 1) header_changes.path = /*path*/ ctx[0];
    			if (dirty & /*writeOutputPromise*/ 4) header_changes.writeOutput = /*writeOutput*/ ctx[8];
    			header.$set(header_changes);
    			const section_changes = {};
    			if (dirty & /*writeOutputPromise*/ 4) section_changes.writeOutput = /*writeOutput*/ ctx[8];
    			if (dirty & /*writeOutputPromise*/ 4) section_changes.matchesParagraph = /*matchesParagraph*/ ctx[10];
    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(61:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (53:4) {#if writeOutput.success}
    function create_if_block(ctx) {
    	let header;
    	let t0;
    	let nav;
    	let t1;
    	let t2;
    	let section;
    	let t3;
    	let footer;
    	let current;

    	header = new Header({
    			props: {
    				path: /*path*/ ctx[0],
    				writeOutput: /*writeOutput*/ ctx[8],
    				UserOutput: /*UserOutput*/ ctx[9]
    			},
    			$$inline: true
    		});

    	nav = new Nav({
    			props: { writeOutput: /*writeOutput*/ ctx[8] },
    			$$inline: true
    		});

    	let if_block = /*matchesParagraph*/ ctx[10].length !== 0 && create_if_block_1(ctx);

    	section = new Section({
    			props: {
    				writeOutput: /*writeOutput*/ ctx[8],
    				matchesParagraph: /*matchesParagraph*/ ctx[10]
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(nav.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			create_component(section.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(nav, target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(section, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};
    			if (dirty & /*path*/ 1) header_changes.path = /*path*/ ctx[0];
    			if (dirty & /*writeOutputPromise*/ 4) header_changes.writeOutput = /*writeOutput*/ ctx[8];
    			header.$set(header_changes);
    			const nav_changes = {};
    			if (dirty & /*writeOutputPromise*/ 4) nav_changes.writeOutput = /*writeOutput*/ ctx[8];
    			nav.$set(nav_changes);

    			if (/*matchesParagraph*/ ctx[10].length !== 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*writeOutputPromise*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t2.parentNode, t2);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const section_changes = {};
    			if (dirty & /*writeOutputPromise*/ 4) section_changes.writeOutput = /*writeOutput*/ ctx[8];
    			if (dirty & /*writeOutputPromise*/ 4) section_changes.matchesParagraph = /*matchesParagraph*/ ctx[10];
    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(section.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(section.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(section, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(53:4) {#if writeOutput.success}",
    		ctx
    	});

    	return block;
    }

    // (56:5) {#if matchesParagraph.length !== 0}
    function create_if_block_1(ctx) {
    	let aside;
    	let current;

    	aside = new Aside({
    			props: {
    				matchesParagraph: /*matchesParagraph*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(aside.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(aside, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const aside_changes = {};
    			if (dirty & /*writeOutputPromise*/ 4) aside_changes.matchesParagraph = /*matchesParagraph*/ ctx[10];
    			aside.$set(aside_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(aside.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(aside.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(aside, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(56:5) {#if matchesParagraph.length !== 0}",
    		ctx
    	});

    	return block;
    }

    // (48:29)      <div></div>    {:then UserOutput}
    function create_pending_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "svelte-1bps8dd");
    			add_location(div, file$7, 48, 4, 1332);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1$1.name,
    		type: "pending",
    		source: "(48:29)      <div></div>    {:then UserOutput}",
    		ctx
    	});

    	return block;
    }

    // (45:29)     <div></div>   {:then writeOutput}
    function create_pending_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "svelte-1bps8dd");
    			add_location(div, file$7, 45, 3, 1264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(45:29)     <div></div>   {:then writeOutput}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let t0;
    	let div;
    	let promise_1;
    	let t1;
    	let button;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_2,
    		then: create_then_block_2,
    		catch: create_catch_block_2,
    		value: 9,
    		blocks: [,,,]
    	};

    	handle_promise(/*UserOutputPromise*/ ctx[3], info);

    	let info_1 = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block_1$1,
    		value: 8,
    		blocks: [,,,]
    	};

    	handle_promise(promise_1 = /*writeOutputPromise*/ ctx[2], info_1);

    	const block = {
    		c: function create() {
    			main = element("main");
    			info.block.c();
    			t0 = space();
    			div = element("div");
    			info_1.block.c();
    			t1 = space();
    			button = element("button");
    			attr_dev(div, "id", "contents");
    			attr_dev(div, "class", "svelte-1bps8dd");
    			add_location(div, file$7, 43, 1, 1211);
    			attr_dev(button, "class", "svelte-1bps8dd");
    			add_location(button, file$7, 69, 1, 2040);
    			attr_dev(main, "class", "svelte-1bps8dd");
    			add_location(main, file$7, 37, 0, 1050);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t0;
    			append_dev(main, t0);
    			append_dev(main, div);
    			info_1.block.m(div, info_1.anchor = null);
    			info_1.mount = () => div;
    			info_1.anchor = null;
    			append_dev(main, t1);
    			append_dev(main, button);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    			info_1.ctx = ctx;

    			if (dirty & /*writeOutputPromise*/ 4 && promise_1 !== (promise_1 = /*writeOutputPromise*/ ctx[2]) && handle_promise(promise_1, info_1)) ; else {
    				update_await_block_branch(info_1, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(info_1.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			for (let i = 0; i < 3; i += 1) {
    				const block = info_1.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			info_1.block.d();
    			info_1.token = null;
    			info_1 = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function getUser$1() {
    	const res = await fetch("/user/information", { method: "POST" });
    	const json = await res.json();
    	return json;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let { path = undefined } = $$props;
    	let hiddenButton = false;
    	let temp;

    	if (path === '') {
    		window.location.href = "/";
    	}

    	let url;

    	async function getWrite() {
    		console.log(path);

    		if (hiddenButton) {
    			url = `/write/output?path=${path}&hb=${hiddenButton}`;
    		} else {
    			url = `/write/output?path=${path}`;
    		}

    		const res = await fetch(url, { method: 'POST', mode: 'cors' });
    		const json = await res.json();
    		return json;
    	}

    	let writeOutputPromise = getWrite();
    	const UserOutputPromise = getUser$1();
    	const writable_props = ['path'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	function search_bar_hidden_binding(value) {
    		hiddenButton = value;
    		$$invalidate(1, hiddenButton);
    	}

    	$$self.$$set = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    	};

    	$$self.$capture_state = () => ({
    		Header,
    		Nav,
    		Aside,
    		Footer,
    		Section,
    		Search_bar,
    		path,
    		hiddenButton,
    		temp,
    		url,
    		getWrite,
    		writeOutputPromise,
    		getUser: getUser$1,
    		UserOutputPromise
    	});

    	$$self.$inject_state = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    		if ('hiddenButton' in $$props) $$invalidate(1, hiddenButton = $$props.hiddenButton);
    		if ('temp' in $$props) temp = $$props.temp;
    		if ('url' in $$props) url = $$props.url;
    		if ('writeOutputPromise' in $$props) $$invalidate(2, writeOutputPromise = $$props.writeOutputPromise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*hiddenButton*/ 2) {
    			{
    				$$invalidate(2, writeOutputPromise = getWrite());
    			}
    		}
    	};

    	return [
    		path,
    		hiddenButton,
    		writeOutputPromise,
    		UserOutputPromise,
    		search_bar_hidden_binding
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { path: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get path() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Login/Login_Content.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$6 = "src/components/Login/Login_Content.svelte";

    function create_fragment$6(ctx) {
    	let article;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let div7;
    	let div6;
    	let form;
    	let div2;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div3;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div4;
    	let label2;
    	let input2;
    	let t8;
    	let span;
    	let t10;
    	let a0;
    	let t12;
    	let div5;
    	let a1;
    	let t14;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			article = element("article");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "로그인";
    			t1 = space();
    			div7 = element("div");
    			div6 = element("div");
    			form = element("form");
    			div2 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Password";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div4 = element("div");
    			label2 = element("label");
    			input2 = element("input");
    			t8 = space();
    			span = element("span");
    			span.textContent = "자동 로그인";
    			t10 = space();
    			a0 = element("a");
    			a0.textContent = "[아이디/비밀번호 찾기]";
    			t12 = space();
    			div5 = element("div");
    			a1 = element("a");
    			a1.textContent = "계정 만들기";
    			t14 = space();
    			button = element("button");
    			button.textContent = "로그인";
    			attr_dev(h1, "id", "Login_Text");
    			attr_dev(h1, "class", "svelte-2nee77");
    			add_location(h1, file$6, 35, 12, 837);
    			attr_dev(div0, "id", "Login_Title_2");
    			attr_dev(div0, "class", "svelte-2nee77");
    			add_location(div0, file$6, 34, 8, 799);
    			attr_dev(div1, "id", "Login_Title");
    			attr_dev(div1, "class", "svelte-2nee77");
    			add_location(div1, file$6, 33, 4, 767);
    			attr_dev(label0, "for", "usernameInput");
    			attr_dev(label0, "class", "svelte-2nee77");
    			add_location(label0, file$6, 42, 20, 1070);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "usernameInput");
    			attr_dev(input0, "name", "email");
    			attr_dev(input0, "class", "svelte-2nee77");
    			add_location(input0, file$6, 43, 20, 1132);
    			attr_dev(div2, "class", "usernameBox svelte-2nee77");
    			add_location(div2, file$6, 41, 16, 1023);
    			attr_dev(label1, "for", "passwordInput");
    			attr_dev(label1, "class", "svelte-2nee77");
    			add_location(label1, file$6, 46, 20, 1291);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "id", "passwordInput");
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "class", "svelte-2nee77");
    			add_location(input1, file$6, 47, 20, 1356);
    			attr_dev(div3, "class", "usernameBox svelte-2nee77");
    			add_location(div3, file$6, 45, 16, 1244);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "name", "autologin");
    			add_location(input2, file$6, 51, 24, 1576);
    			attr_dev(span, "class", "svelte-2nee77");
    			add_location(span, file$6, 52, 24, 1642);
    			attr_dev(label2, "id", "autoLoginLabel");
    			attr_dev(label2, "class", "svelte-2nee77");
    			add_location(label2, file$6, 50, 20, 1523);
    			attr_dev(div4, "id", "autoLoginBox");
    			attr_dev(div4, "class", "svelte-2nee77");
    			add_location(div4, file$6, 49, 16, 1478);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "id", "findID");
    			attr_dev(a0, "class", "svelte-2nee77");
    			add_location(a0, file$6, 55, 16, 1733);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "id", "MakeProfile");
    			attr_dev(a1, "class", "svelte-2nee77");
    			add_location(a1, file$6, 57, 20, 1834);
    			attr_dev(button, "id", "LoginButton");
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-2nee77");
    			add_location(button, file$6, 58, 20, 1895);
    			attr_dev(div5, "id", "buttonBox");
    			attr_dev(div5, "class", "svelte-2nee77");
    			add_location(div5, file$6, 56, 16, 1792);
    			attr_dev(form, "method", "post");
    			attr_dev(form, "id", "LoginForm");
    			attr_dev(form, "class", "svelte-2nee77");
    			add_location(form, file$6, 40, 12, 933);
    			add_location(div6, file$6, 39, 8, 914);
    			add_location(div7, file$6, 38, 4, 899);
    			attr_dev(article, "class", "svelte-2nee77");
    			add_location(article, file$6, 32, 0, 752);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(article, t1);
    			append_dev(article, div7);
    			append_dev(div7, div6);
    			append_dev(div6, form);
    			append_dev(form, div2);
    			append_dev(div2, label0);
    			append_dev(div2, t3);
    			append_dev(div2, input0);
    			set_input_value(input0, /*email*/ ctx[0]);
    			append_dev(form, t4);
    			append_dev(form, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t6);
    			append_dev(div3, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			append_dev(form, t7);
    			append_dev(form, div4);
    			append_dev(div4, label2);
    			append_dev(label2, input2);
    			append_dev(label2, t8);
    			append_dev(label2, span);
    			append_dev(form, t10);
    			append_dev(form, a0);
    			append_dev(form, t12);
    			append_dev(form, div5);
    			append_dev(div5, a1);
    			append_dev(div5, t14);
    			append_dev(div5, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(form, "submit", prevent_default(/*post_form*/ ctx[2]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*email*/ 1 && input0.value !== /*email*/ ctx[0]) {
    				set_input_value(input0, /*email*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login_Content', slots, []);
    	let email = '';
    	let password = '';

    	async function post_form() {
    		const user = { email, password };

    		await fetch("/login", {
    			method: "POST",
    			headers: { 'Content-Type': 'application/json' },
    			body: JSON.stringify(user)
    		}).then(response => {
    			response.json().then(j => {
    				if (j.success) {
    					window.location.href = "/";
    				} else {
    					alert('이메일 / 비밀번호가 올바르지 않습니다!');
    				}
    			});
    		}).catch(error => {
    			console.log('error');
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Login_Content> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({ email, password, post_form });

    	$$self.$inject_state = $$props => {
    		if ('email' in $$props) $$invalidate(0, email = $$props.email);
    		if ('password' in $$props) $$invalidate(1, password = $$props.password);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [email, password, post_form, input0_input_handler, input1_input_handler];
    }

    class Login_Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login_Content",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/routes/Login.svelte generated by Svelte v3.59.2 */
    const file$5 = "src/routes/Login.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let search_bar;
    	let t;
    	let div;
    	let logincontent;
    	let current;
    	search_bar = new Search_bar({ $$inline: true });
    	logincontent = new Login_Content({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(search_bar.$$.fragment);
    			t = space();
    			div = element("div");
    			create_component(logincontent.$$.fragment);
    			attr_dev(div, "id", "contents");
    			attr_dev(div, "class", "svelte-1bps8dd");
    			add_location(div, file$5, 8, 1, 212);
    			attr_dev(main, "class", "svelte-1bps8dd");
    			add_location(main, file$5, 6, 0, 175);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(search_bar, main, null);
    			append_dev(main, t);
    			append_dev(main, div);
    			mount_component(logincontent, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search_bar.$$.fragment, local);
    			transition_in(logincontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search_bar.$$.fragment, local);
    			transition_out(logincontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(search_bar);
    			destroy_component(logincontent);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	let { path } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (path === undefined && !('path' in $$props || $$self.$$.bound[$$self.$$.props['path']])) {
    			console.warn("<Login> was created without expected prop 'path'");
    		}
    	});

    	const writable_props = ['path'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    	};

    	$$self.$capture_state = () => ({ LoginContent: Login_Content, Search_bar, path });

    	$$self.$inject_state = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [path];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { path: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get path() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Editscreen/Article.svelte generated by Svelte v3.59.2 */
    const file$4 = "src/components/Editscreen/Article.svelte";

    function create_fragment$4(ctx) {
    	let article;
    	let div3;
    	let div0;
    	let h1;
    	let a0;
    	let t0;
    	let a0_href_value;
    	let t1;
    	let div2;
    	let div1;
    	let a1;
    	let svg0;
    	let path0;
    	let t2;
    	let t3;
    	let a2;
    	let svg1;
    	let path1;
    	let t4;
    	let t5;
    	let a3;
    	let svg2;
    	let path2;
    	let t6;
    	let t7;
    	let div15;
    	let div14;
    	let form;
    	let ul;
    	let li0;
    	let button0;
    	let t9;
    	let li1;
    	let button1;
    	let t11;
    	let li2;
    	let button2;
    	let t13;
    	let li3;
    	let div4;
    	let button3;
    	let t15;
    	let div5;
    	let button4;
    	let t17;
    	let div6;
    	let button5;
    	let t19;
    	let div7;
    	let button6;
    	let t21;
    	let div8;
    	let button7;
    	let t23;
    	let div9;
    	let button8;
    	let t25;
    	let div10;
    	let button9;
    	let t27;
    	let div11;
    	let textarea;
    	let t28;
    	let div12;
    	let label0;
    	let t30;
    	let input0;
    	let t31;
    	let label1;
    	let input1;
    	let t32;
    	let span0;
    	let t33;
    	let strong0;
    	let t35;
    	let strong1;
    	let t37;
    	let strong2;
    	let t39;
    	let span2;
    	let t40;
    	let br;
    	let a4;
    	let b;
    	let t42;
    	let span1;
    	let t44;
    	let t45;
    	let button10;
    	let t47;
    	let div13;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			article = element("article");
    			div3 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			a0 = element("a");
    			t0 = text(/*path*/ ctx[0]);
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			a1 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t2 = text(" 역링크");
    			t3 = space();
    			a2 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t4 = text(" 이동");
    			t5 = space();
    			a3 = element("a");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t6 = text(" 삭제");
    			t7 = space();
    			div15 = element("div");
    			div14 = element("div");
    			form = element("form");
    			ul = element("ul");
    			li0 = element("li");
    			button0 = element("button");
    			button0.textContent = "편집기";
    			t9 = space();
    			li1 = element("li");
    			button1 = element("button");
    			button1.textContent = "RAW 편집";
    			t11 = space();
    			li2 = element("li");
    			button2 = element("button");
    			button2.textContent = "미리보기";
    			t13 = space();
    			li3 = element("li");
    			div4 = element("div");
    			button3 = element("button");
    			button3.textContent = "굵게";
    			t15 = space();
    			div5 = element("div");
    			button4 = element("button");
    			button4.textContent = "기울임";
    			t17 = space();
    			div6 = element("div");
    			button5 = element("button");
    			button5.textContent = "취소선";
    			t19 = space();
    			div7 = element("div");
    			button6 = element("button");
    			button6.textContent = "링크";
    			t21 = space();
    			div8 = element("div");
    			button7 = element("button");
    			button7.textContent = "파일";
    			t23 = space();
    			div9 = element("div");
    			button8 = element("button");
    			button8.textContent = "각주";
    			t25 = space();
    			div10 = element("div");
    			button9 = element("button");
    			button9.textContent = "틀";
    			t27 = space();
    			div11 = element("div");
    			textarea = element("textarea");
    			t28 = space();
    			div12 = element("div");
    			label0 = element("label");
    			label0.textContent = "요약";
    			t30 = space();
    			input0 = element("input");
    			t31 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t32 = space();
    			span0 = element("span");
    			t33 = text("문서 편집을 \r\n                        ");
    			strong0 = element("strong");
    			strong0.textContent = "저장";
    			t35 = text("\r\n                        하면 당신은 기여한 내용을 \r\n                        ");
    			strong1 = element("strong");
    			strong1.textContent = "CC-BY-NC-SA 2.0 KR";
    			t37 = text("\r\n                        으로 배포하고 기여한 문서에 대한 하이퍼링크나 URL을 이용하여 저작자 표시를 하는 것으로 충분하다는 데 동의하는 것입니다. 이 \r\n                        ");
    			strong2 = element("strong");
    			strong2.textContent = "동의는 철회할 수 없습니다.";
    			t39 = space();
    			span2 = element("span");
    			t40 = text("편집 요청은 편집 권한이 있는 사용자가 승인할 수 있습니다. 편집 권한이 있는 사용자가 확인 할 수 있도록 편집 내용을 뒷받침할 수 있는 출처 또는 근거를 타 사용자가 확인 가능하도록 편집 요약에 입력해 주세요.");
    			br = element("br");
    			a4 = element("a");
    			b = element("b");
    			b.textContent = "문서 관리 방침";
    			t42 = text("에서는 ");
    			span1 = element("span");
    			span1.textContent = "정당한 사유가 기재되지 않은 편집 요청에 대해서 관리자 직권으로 닫기 처리";
    			t44 = text("할 수 있도록 규정하고 있습니다. 편집 요청 시에는 편집 요약을 통해 근거를 포함하시는 것을 강력하게 권장합니다.");
    			t45 = space();
    			button10 = element("button");
    			button10.textContent = "저장";
    			t47 = space();
    			div13 = element("div");
    			attr_dev(a0, "href", a0_href_value = "/w/" + /*path*/ ctx[0]);
    			attr_dev(a0, "class", "svelte-r0d6t3");
    			add_location(a0, file$4, 44, 16, 1230);
    			attr_dev(h1, "class", "Edit_title svelte-r0d6t3");
    			add_location(h1, file$4, 43, 12, 1189);
    			attr_dev(div0, "class", "Edit_title_div svelte-r0d6t3");
    			add_location(div0, file$4, 42, 8, 1147);
    			attr_dev(path0, "d", "M320 96a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm21.1 80C367 158.8 384 129.4 384 96c0-53-43-96-96-96s-96 43-96 96c0 33.4 17 62.8 42.9 80H224c-17.7 0-32 14.3-32 32s14.3 32 32 32h32V448H208c-53 0-96-43-96-96v-6.1l7 7c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L97 263c-9.4-9.4-24.6-9.4-33.9 0L7 319c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l7-7V352c0 88.4 71.6 160 160 160h80 80c88.4 0 160-71.6 160-160v-6.1l7 7c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-56-56c-9.4-9.4-24.6-9.4-33.9 0l-56 56c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l7-7V352c0 53-43 96-96 96H320V240h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H341.1z");
    			add_location(path0, file$4, 51, 24, 1608);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "height", "1em");
    			attr_dev(svg0, "viewBox", "0 0 576 512");
    			attr_dev(svg0, "class", "button_icon svelte-r0d6t3");
    			add_location(svg0, file$4, 50, 20, 1487);
    			attr_dev(a1, "href", "/backlink/Limbus%20Company/%EC%84%A0%ED%83%9D%EC%A7%80");
    			attr_dev(a1, "class", "Backbutton svelte-r0d6t3");
    			add_location(a1, file$4, 49, 16, 1381);
    			attr_dev(path1, "d", "M0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM294.6 135.1l99.9 107.1c3.5 3.8 5.5 8.7 5.5 13.8s-2 10.1-5.5 13.8L294.6 376.9c-4.2 4.5-10.1 7.1-16.3 7.1C266 384 256 374 256 361.7l0-57.7-96 0c-17.7 0-32-14.3-32-32l0-32c0-17.7 14.3-32 32-32l96 0 0-57.7c0-12.3 10-22.3 22.3-22.3c6.2 0 12.1 2.6 16.3 7.1z");
    			add_location(path1, file$4, 56, 24, 2534);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "height", "1em");
    			attr_dev(svg1, "viewBox", "0 0 512 512");
    			attr_dev(svg1, "class", "button_icon svelte-r0d6t3");
    			add_location(svg1, file$4, 55, 20, 2413);
    			attr_dev(a2, "href", "/move/Limbus%20Company/%EC%84%A0%ED%83%9D%EC%A7%80");
    			attr_dev(a2, "class", "Movebutton svelte-r0d6t3");
    			attr_dev(a2, "rel", "nofollow");
    			add_location(a2, file$4, 54, 16, 2296);
    			attr_dev(path2, "d", "M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z");
    			add_location(path2, file$4, 61, 24, 3180);
    			attr_dev(svg2, "data-v-cdf505ee", "");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "height", "1em");
    			attr_dev(svg2, "viewBox", "0 0 448 512");
    			attr_dev(svg2, "class", "button_icon svelte-r0d6t3");
    			add_location(svg2, file$4, 60, 20, 3040);
    			attr_dev(a3, "href", "/delete/Limbus%20Company/%EC%84%A0%ED%83%9D%EC%A7%80");
    			attr_dev(a3, "class", "Delbutton svelte-r0d6t3");
    			attr_dev(a3, "rel", "nofollow");
    			add_location(a3, file$4, 59, 16, 2922);
    			attr_dev(div1, "class", "sort svelte-r0d6t3");
    			add_location(div1, file$4, 48, 12, 1345);
    			attr_dev(div2, "class", "Edit_buttons svelte-r0d6t3");
    			add_location(div2, file$4, 47, 8, 1305);
    			attr_dev(div3, "id", "Edit_headline");
    			attr_dev(div3, "class", "svelte-r0d6t3");
    			add_location(div3, file$4, 41, 4, 1113);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "osong_button svelte-r0d6t3");
    			add_location(button0, file$4, 72, 24, 3975);
    			attr_dev(li0, "class", "svelte-r0d6t3");
    			add_location(li0, file$4, 71, 20, 3945);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "osong_button svelte-r0d6t3");
    			add_location(button1, file$4, 75, 24, 4109);
    			attr_dev(li1, "class", "svelte-r0d6t3");
    			add_location(li1, file$4, 74, 20, 4079);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "osong_button svelte-r0d6t3");
    			add_location(button2, file$4, 78, 24, 4246);
    			attr_dev(li2, "class", "svelte-r0d6t3");
    			add_location(li2, file$4, 77, 20, 4216);
    			attr_dev(button3, "type", "button");
    			attr_dev(button3, "class", "osong_button svelte-r0d6t3");
    			add_location(button3, file$4, 81, 29, 4404);
    			add_location(div4, file$4, 81, 24, 4399);
    			attr_dev(button4, "type", "button");
    			attr_dev(button4, "class", "osong_button svelte-r0d6t3");
    			add_location(button4, file$4, 82, 29, 4495);
    			add_location(div5, file$4, 82, 24, 4490);
    			attr_dev(button5, "type", "button");
    			attr_dev(button5, "class", "osong_button svelte-r0d6t3");
    			add_location(button5, file$4, 83, 29, 4587);
    			add_location(div6, file$4, 83, 24, 4582);
    			attr_dev(button6, "type", "button");
    			attr_dev(button6, "class", "osong_button svelte-r0d6t3");
    			add_location(button6, file$4, 84, 29, 4679);
    			add_location(div7, file$4, 84, 24, 4674);
    			attr_dev(button7, "type", "button");
    			attr_dev(button7, "class", "osong_button svelte-r0d6t3");
    			add_location(button7, file$4, 85, 29, 4770);
    			add_location(div8, file$4, 85, 24, 4765);
    			attr_dev(button8, "type", "button");
    			attr_dev(button8, "class", "osong_button svelte-r0d6t3");
    			add_location(button8, file$4, 86, 29, 4861);
    			add_location(div9, file$4, 86, 24, 4856);
    			attr_dev(button9, "type", "button");
    			attr_dev(button9, "class", "osong_button svelte-r0d6t3");
    			add_location(button9, file$4, 87, 29, 4952);
    			add_location(div10, file$4, 87, 24, 4947);
    			attr_dev(li3, "class", "text_tool svelte-r0d6t3");
    			add_location(li3, file$4, 80, 20, 4351);
    			attr_dev(ul, "class", "svelte-r0d6t3");
    			add_location(ul, file$4, 70, 16, 3919);
    			attr_dev(textarea, "class", "Text_box svelte-r0d6t3");
    			attr_dev(textarea, "name", "edit");
    			add_location(textarea, file$4, 91, 20, 5126);
    			attr_dev(div11, "class", "Edit_window svelte-r0d6t3");
    			add_location(div11, file$4, 90, 16, 5079);
    			attr_dev(label0, "for", "logInput");
    			add_location(label0, file$4, 94, 20, 5288);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "logInput");
    			attr_dev(input0, "name", "log");
    			attr_dev(input0, "class", "svelte-r0d6t3");
    			add_location(input0, file$4, 95, 20, 5342);
    			attr_dev(div12, "class", "logInput_div svelte-r0d6t3");
    			add_location(div12, file$4, 93, 16, 5240);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "name", "agree");
    			input1.value = "Y";
    			attr_dev(input1, "class", "Edit_agree_checkbox svelte-r0d6t3");
    			add_location(input1, file$4, 98, 20, 5497);
    			add_location(strong0, file$4, 101, 24, 5725);
    			add_location(strong1, file$4, 103, 24, 5811);
    			add_location(strong2, file$4, 105, 24, 5970);
    			attr_dev(span0, "class", "edit_agree_span svelte-r0d6t3");
    			add_location(span0, file$4, 99, 20, 5593);
    			attr_dev(label1, "class", "edit_agree svelte-r0d6t3");
    			add_location(label1, file$4, 97, 16, 5449);
    			add_location(br, file$4, 108, 159, 6218);
    			add_location(b, file$4, 108, 336, 6395);
    			attr_dev(a4, "href", "https://namu.wiki/w/%EB%82%98%EB%AC%B4%EC%9C%84%ED%82%A4:%EA%B8%B0%EB%B3%B8%EB%B0%A9%EC%B9%A8/%EB%AC%B8%EC%84%9C%20%EA%B4%80%EB%A6%AC%20%EB%B0%A9%EC%B9%A8#s-1.2.1");
    			attr_dev(a4, "class", "svelte-r0d6t3");
    			add_location(a4, file$4, 108, 163, 6222);
    			set_style(span1, "color", "red");
    			set_style(span1, "text-decoration", "underline");
    			set_style(span1, "font-weight", "bold");
    			add_location(span1, file$4, 108, 359, 6418);
    			attr_dev(span2, "data-v-5d316e06", "");
    			add_location(span2, file$4, 108, 16, 6075);
    			attr_dev(button10, "class", "Save_button svelte-r0d6t3");
    			attr_dev(button10, "type", "submit");
    			add_location(button10, file$4, 109, 16, 6627);
    			attr_dev(form, "class", "Edit_from");
    			add_location(form, file$4, 69, 12, 3841);
    			add_location(div13, file$4, 111, 12, 6715);
    			add_location(div14, file$4, 68, 8, 3822);
    			attr_dev(div15, "id", "Edit_main");
    			attr_dev(div15, "class", "svelte-r0d6t3");
    			add_location(div15, file$4, 67, 4, 3792);
    			attr_dev(article, "class", "svelte-r0d6t3");
    			add_location(article, file$4, 40, 0, 1098);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h1);
    			append_dev(h1, a0);
    			append_dev(a0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, a1);
    			append_dev(a1, svg0);
    			append_dev(svg0, path0);
    			append_dev(a1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, a2);
    			append_dev(a2, svg1);
    			append_dev(svg1, path1);
    			append_dev(a2, t4);
    			append_dev(div1, t5);
    			append_dev(div1, a3);
    			append_dev(a3, svg2);
    			append_dev(svg2, path2);
    			append_dev(a3, t6);
    			append_dev(article, t7);
    			append_dev(article, div15);
    			append_dev(div15, div14);
    			append_dev(div14, form);
    			append_dev(form, ul);
    			append_dev(ul, li0);
    			append_dev(li0, button0);
    			append_dev(ul, t9);
    			append_dev(ul, li1);
    			append_dev(li1, button1);
    			append_dev(ul, t11);
    			append_dev(ul, li2);
    			append_dev(li2, button2);
    			append_dev(ul, t13);
    			append_dev(ul, li3);
    			append_dev(li3, div4);
    			append_dev(div4, button3);
    			append_dev(li3, t15);
    			append_dev(li3, div5);
    			append_dev(div5, button4);
    			append_dev(li3, t17);
    			append_dev(li3, div6);
    			append_dev(div6, button5);
    			append_dev(li3, t19);
    			append_dev(li3, div7);
    			append_dev(div7, button6);
    			append_dev(li3, t21);
    			append_dev(li3, div8);
    			append_dev(div8, button7);
    			append_dev(li3, t23);
    			append_dev(li3, div9);
    			append_dev(div9, button8);
    			append_dev(li3, t25);
    			append_dev(li3, div10);
    			append_dev(div10, button9);
    			append_dev(form, t27);
    			append_dev(form, div11);
    			append_dev(div11, textarea);
    			set_input_value(textarea, /*mainText*/ ctx[1]);
    			append_dev(form, t28);
    			append_dev(form, div12);
    			append_dev(div12, label0);
    			append_dev(div12, t30);
    			append_dev(div12, input0);
    			set_input_value(input0, /*message*/ ctx[2]);
    			append_dev(form, t31);
    			append_dev(form, label1);
    			append_dev(label1, input1);
    			append_dev(label1, t32);
    			append_dev(label1, span0);
    			append_dev(span0, t33);
    			append_dev(span0, strong0);
    			append_dev(span0, t35);
    			append_dev(span0, strong1);
    			append_dev(span0, t37);
    			append_dev(span0, strong2);
    			append_dev(form, t39);
    			append_dev(form, span2);
    			append_dev(span2, t40);
    			append_dev(span2, br);
    			append_dev(span2, a4);
    			append_dev(a4, b);
    			append_dev(span2, t42);
    			append_dev(span2, span1);
    			append_dev(span2, t44);
    			append_dev(form, t45);
    			append_dev(form, button10);
    			append_dev(div14, t47);
    			append_dev(div14, div13);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[6]),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(form, "submit", prevent_default(/*postForm*/ ctx[3]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*path*/ 1) set_data_dev(t0, /*path*/ ctx[0]);

    			if (dirty & /*path*/ 1 && a0_href_value !== (a0_href_value = "/w/" + /*path*/ ctx[0])) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*mainText*/ 2) {
    				set_input_value(textarea, /*mainText*/ ctx[1]);
    			}

    			if (dirty & /*message*/ 4 && input0.value !== /*message*/ ctx[2]) {
    				set_input_value(input0, /*message*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const defaultUserAuth = 4;

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Article', slots, []);
    	let { path = '' } = $$props;

    	let { writeOutput = {
    		data: { content: '', authority: defaultUserAuth }
    	} } = $$props;

    	let { hidden = false } = $$props;
    	let mainText;

    	if (writeOutput.success) {
    		mainText = writeOutput.data.content;
    	} else {
    		mainText = '';
    	}

    	let message = '';

    	async function postForm() {
    		// TODO: 만약 권한 있으면 비밀의 버튼 Search_bar에 뜨게 해서, 누르면 숨겨진 글 수정할 수 있게 하기
    		const objectForm = { content: mainText, message, path };

    		const url = 'write/edit_archive';

    		fetch(`/${url}?hb=${hidden}`, {
    			method: "POST",
    			headers: { 'Content-Type': 'application/json' },
    			body: JSON.stringify(objectForm)
    		}).then(response => {
    			response.json().then(json => {
    				window.location.href = "/w/" + path;
    			});
    		}).catch(error => {
    			alert('error');
    		});
    	}

    	const writable_props = ['path', 'writeOutput', 'hidden'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Article> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		mainText = this.value;
    		$$invalidate(1, mainText);
    	}

    	function input0_input_handler() {
    		message = this.value;
    		$$invalidate(2, message);
    	}

    	$$self.$$set = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    		if ('writeOutput' in $$props) $$invalidate(4, writeOutput = $$props.writeOutput);
    		if ('hidden' in $$props) $$invalidate(5, hidden = $$props.hidden);
    	};

    	$$self.$capture_state = () => ({
    		main: app,
    		defaultUserAuth,
    		path,
    		writeOutput,
    		hidden,
    		mainText,
    		message,
    		postForm
    	});

    	$$self.$inject_state = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    		if ('writeOutput' in $$props) $$invalidate(4, writeOutput = $$props.writeOutput);
    		if ('hidden' in $$props) $$invalidate(5, hidden = $$props.hidden);
    		if ('mainText' in $$props) $$invalidate(1, mainText = $$props.mainText);
    		if ('message' in $$props) $$invalidate(2, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		path,
    		mainText,
    		message,
    		postForm,
    		writeOutput,
    		hidden,
    		textarea_input_handler,
    		input0_input_handler
    	];
    }

    class Article extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { path: 0, writeOutput: 4, hidden: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Article",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get path() {
    		throw new Error("<Article>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Article>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get writeOutput() {
    		throw new Error("<Article>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set writeOutput(value) {
    		throw new Error("<Article>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hidden() {
    		throw new Error("<Article>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hidden(value) {
    		throw new Error("<Article>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/EditScreen.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$3 = "src/routes/EditScreen.svelte";

    // (1:0) <script>   import Article from '../components/Editscreen/Article.svelte';   import Search_bar from './../components/Search_bar.svelte';     export let path = '';   let hiddenButton = false;     async function getWrite(){    console.log(path);    const res = await fetch(`/write/output?path=${path}
    function create_catch_block_1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(1:0) <script>   import Article from '../components/Editscreen/Article.svelte';   import Search_bar from './../components/Search_bar.svelte';     export let path = '';   let hiddenButton = false;     async function getWrite(){    console.log(path);    const res = await fetch(`/write/output?path=${path}",
    		ctx
    	});

    	return block;
    }

    // (30:1) {:then writeOutput}
    function create_then_block(ctx) {
    	let await_block_anchor;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block,
    		value: 7,
    		blocks: [,,,]
    	};

    	handle_promise(/*UserOutputPromise*/ ctx[3], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(30:1) {:then writeOutput}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import Article from '../components/Editscreen/Article.svelte';   import Search_bar from './../components/Search_bar.svelte';     export let path = '';   let hiddenButton = false;     async function getWrite(){    console.log(path);    const res = await fetch(`/write/output?path=${path}
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   import Article from '../components/Editscreen/Article.svelte';   import Search_bar from './../components/Search_bar.svelte';     export let path = '';   let hiddenButton = false;     async function getWrite(){    console.log(path);    const res = await fetch(`/write/output?path=${path}",
    		ctx
    	});

    	return block;
    }

    // (33:2) {:then UserOutput}
    function create_then_block_1(ctx) {
    	let search_bar;
    	let updating_hidden;
    	let t;
    	let div;
    	let article;
    	let current;

    	function search_bar_hidden_binding(value) {
    		/*search_bar_hidden_binding*/ ctx[4](value);
    	}

    	let search_bar_props = { UserOutput: /*UserOutput*/ ctx[7] };

    	if (/*hiddenButton*/ ctx[1] !== void 0) {
    		search_bar_props.hidden = /*hiddenButton*/ ctx[1];
    	}

    	search_bar = new Search_bar({ props: search_bar_props, $$inline: true });
    	binding_callbacks.push(() => bind(search_bar, 'hidden', search_bar_hidden_binding));

    	article = new Article({
    			props: {
    				path: /*path*/ ctx[0],
    				writeOutput: /*writeOutput*/ ctx[6],
    				hidden: /*hiddenButton*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(search_bar.$$.fragment);
    			t = space();
    			div = element("div");
    			create_component(article.$$.fragment);
    			attr_dev(div, "id", "contents");
    			attr_dev(div, "class", "svelte-17o536c");
    			add_location(div, file$3, 34, 3, 973);
    		},
    		m: function mount(target, anchor) {
    			mount_component(search_bar, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(article, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const search_bar_changes = {};

    			if (!updating_hidden && dirty & /*hiddenButton*/ 2) {
    				updating_hidden = true;
    				search_bar_changes.hidden = /*hiddenButton*/ ctx[1];
    				add_flush_callback(() => updating_hidden = false);
    			}

    			search_bar.$set(search_bar_changes);
    			const article_changes = {};
    			if (dirty & /*path*/ 1) article_changes.path = /*path*/ ctx[0];
    			if (dirty & /*writeOutputPromise*/ 4) article_changes.writeOutput = /*writeOutput*/ ctx[6];
    			if (dirty & /*hiddenButton*/ 2) article_changes.hidden = /*hiddenButton*/ ctx[1];
    			article.$set(article_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search_bar.$$.fragment, local);
    			transition_in(article.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search_bar.$$.fragment, local);
    			transition_out(article.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(search_bar, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(33:2) {:then UserOutput}",
    		ctx
    	});

    	return block;
    }

    // (31:28)      <div></div>    {:then UserOutput}
    function create_pending_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "svelte-17o536c");
    			add_location(div, file$3, 31, 3, 852);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(31:28)      <div></div>    {:then UserOutput}",
    		ctx
    	});

    	return block;
    }

    // (28:28)     <div id="contents"> </div>   {:then writeOutput}
    function create_pending_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "contents");
    			attr_dev(div, "class", "svelte-17o536c");
    			add_location(div, file$3, 28, 2, 769);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(28:28)     <div id=\\\"contents\\\"> </div>   {:then writeOutput}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block_1,
    		value: 6,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*writeOutputPromise*/ ctx[2], info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			info.block.c();
    			attr_dev(main, "class", "svelte-17o536c");
    			add_location(main, file$3, 26, 0, 729);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*writeOutputPromise*/ 4 && promise !== (promise = /*writeOutputPromise*/ ctx[2]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function getUser() {
    	const res = await fetch("/user/information", { method: "POST", mode: 'cors' });
    	const json = await res.json();
    	return json;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditScreen', slots, []);
    	let { path = '' } = $$props;
    	let hiddenButton = false;

    	async function getWrite() {
    		console.log(path);
    		const res = await fetch(`/write/output?path=${path}&hb=${hiddenButton}`, { method: 'POST', mode: 'cors' });
    		const json = await res.json();
    		return json;
    	}

    	let writeOutputPromise = getWrite();
    	const UserOutputPromise = getUser();
    	const writable_props = ['path'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<EditScreen> was created with unknown prop '${key}'`);
    	});

    	function search_bar_hidden_binding(value) {
    		hiddenButton = value;
    		$$invalidate(1, hiddenButton);
    	}

    	$$self.$$set = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    	};

    	$$self.$capture_state = () => ({
    		Article,
    		Search_bar,
    		path,
    		hiddenButton,
    		getWrite,
    		writeOutputPromise,
    		getUser,
    		UserOutputPromise
    	});

    	$$self.$inject_state = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    		if ('hiddenButton' in $$props) $$invalidate(1, hiddenButton = $$props.hiddenButton);
    		if ('writeOutputPromise' in $$props) $$invalidate(2, writeOutputPromise = $$props.writeOutputPromise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*hiddenButton*/ 2) {
    			{
    				$$invalidate(2, writeOutputPromise = getWrite());
    			}
    		}
    	};

    	return [
    		path,
    		hiddenButton,
    		writeOutputPromise,
    		UserOutputPromise,
    		search_bar_hidden_binding
    	];
    }

    class EditScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { path: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditScreen",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get path() {
    		throw new Error("<EditScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<EditScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/History/HistoryArticle.svelte generated by Svelte v3.59.2 */

    const file$2 = "src/components/History/HistoryArticle.svelte";

    function create_fragment$2(ctx) {
    	let article;
    	let div3;
    	let div0;
    	let h1;
    	let a0;
    	let t1;
    	let span0;
    	let t3;
    	let div2;
    	let div1;
    	let a1;
    	let svg0;
    	let path0;
    	let t4;
    	let span1;
    	let t6;
    	let a2;
    	let svg1;
    	let path1;
    	let t7;
    	let t8;
    	let div4;

    	const block = {
    		c: function create() {
    			article = element("article");
    			div3 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			a0 = element("a");
    			a0.textContent = "박도현/3학년 4반";
    			t1 = space();
    			span0 = element("span");
    			span0.textContent = "(문서 역사)";
    			t3 = space();
    			div2 = element("div");
    			div1 = element("div");
    			a1 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "편집";
    			t6 = space();
    			a2 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t7 = text(" 역링크");
    			t8 = space();
    			div4 = element("div");
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-47ywi1");
    			add_location(a0, file$2, 4, 16, 132);
    			attr_dev(span0, "class", "Edit_title_no_a svelte-47ywi1");
    			add_location(span0, file$2, 5, 16, 176);
    			attr_dev(h1, "class", "Edit_title svelte-47ywi1");
    			add_location(h1, file$2, 3, 12, 91);
    			attr_dev(div0, "class", "Edit_title_div svelte-47ywi1");
    			add_location(div0, file$2, 2, 8, 49);
    			attr_dev(path0, "d", "M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z");
    			add_location(path0, file$2, 12, 24, 535);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "height", "16");
    			attr_dev(svg0, "width", "16");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "class", "button_icon svelte-47ywi1");
    			add_location(svg0, file$2, 11, 20, 404);
    			add_location(span1, file$2, 14, 20, 1268);
    			attr_dev(a1, "href", "/editscreen");
    			attr_dev(a1, "class", "Backbutton svelte-47ywi1");
    			add_location(a1, file$2, 10, 16, 341);
    			attr_dev(path1, "d", "M320 96a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm21.1 80C367 158.8 384 129.4 384 96c0-53-43-96-96-96s-96 43-96 96c0 33.4 17 62.8 42.9 80H224c-17.7 0-32 14.3-32 32s14.3 32 32 32h32V448H208c-53 0-96-43-96-96v-6.1l7 7c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L97 263c-9.4-9.4-24.6-9.4-33.9 0L7 319c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l7-7V352c0 88.4 71.6 160 160 160h80 80c88.4 0 160-71.6 160-160v-6.1l7 7c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-56-56c-9.4-9.4-24.6-9.4-33.9 0l-56 56c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l7-7V352c0 53-43 96-96 96H320V240h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H341.1z");
    			add_location(path1, file$2, 18, 24, 1550);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "height", "1em");
    			attr_dev(svg1, "viewBox", "0 0 576 512");
    			attr_dev(svg1, "class", "button_icon svelte-47ywi1");
    			add_location(svg1, file$2, 17, 20, 1429);
    			attr_dev(a2, "href", "/backlink/Limbus%20Company/%EC%84%A0%ED%83%9D%EC%A7%80");
    			attr_dev(a2, "class", "Delbutton svelte-47ywi1");
    			add_location(a2, file$2, 16, 16, 1324);
    			attr_dev(div1, "class", "sort svelte-47ywi1");
    			add_location(div1, file$2, 9, 12, 305);
    			attr_dev(div2, "class", "Edit_buttons svelte-47ywi1");
    			add_location(div2, file$2, 8, 8, 265);
    			attr_dev(div3, "id", "Edit_headline");
    			attr_dev(div3, "class", "svelte-47ywi1");
    			add_location(div3, file$2, 1, 4, 15);
    			attr_dev(div4, "id", "History_main");
    			attr_dev(div4, "class", "svelte-47ywi1");
    			add_location(div4, file$2, 24, 4, 2274);
    			attr_dev(article, "class", "svelte-47ywi1");
    			add_location(article, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h1);
    			append_dev(h1, a0);
    			append_dev(h1, t1);
    			append_dev(h1, span0);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, a1);
    			append_dev(a1, svg0);
    			append_dev(svg0, path0);
    			append_dev(a1, t4);
    			append_dev(a1, span1);
    			append_dev(div1, t6);
    			append_dev(div1, a2);
    			append_dev(a2, svg1);
    			append_dev(svg1, path1);
    			append_dev(a2, t7);
    			append_dev(article, t8);
    			append_dev(article, div4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HistoryArticle', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HistoryArticle> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class HistoryArticle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HistoryArticle",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/routes/History.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/routes/History.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let search_bar;
    	let t;
    	let div;
    	let historyarticle;
    	let current;
    	search_bar = new Search_bar({ $$inline: true });
    	historyarticle = new HistoryArticle({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(search_bar.$$.fragment);
    			t = space();
    			div = element("div");
    			create_component(historyarticle.$$.fragment);
    			attr_dev(div, "id", "contents");
    			attr_dev(div, "class", "svelte-1p3amc8");
    			add_location(div, file$1, 6, 4, 201);
    			attr_dev(main, "class", "svelte-1p3amc8");
    			add_location(main, file$1, 4, 0, 161);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(search_bar, main, null);
    			append_dev(main, t);
    			append_dev(main, div);
    			mount_component(historyarticle, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search_bar.$$.fragment, local);
    			transition_in(historyarticle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search_bar.$$.fragment, local);
    			transition_out(historyarticle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(search_bar);
    			destroy_component(historyarticle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('History', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<History> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Search_bar, HistoryArticle });
    	return [];
    }

    class History extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "History",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.59.2 */

    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    derived(loc, _loc => _loc.location);
    derived(loc, _loc => _loc.querystring);
    const params = writable(undefined);

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    // (18:4) <Router {url}>
    function create_default_slot(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let route3;
    	let t3;
    	let route4;
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/",
    				component: Home,
    				requestWrite: ''
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/login",
    				component: Login,
    				requestWrite: ''
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/edit/*path",
    				component: EditScreen,
    				requestWrite: ''
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "/history",
    				component: History,
    				requestWrite: ''
    			},
    			$$inline: true
    		});

    	route4 = new Route({
    			props: {
    				path: "/w/*path",
    				component: Home,
    				requestWrite: ''
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    			t3 = space();
    			create_component(route4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route4, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(18:4) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(router.$$.fragment);
    			add_location(main, file, 16, 0, 493);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(router, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 8) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { url = "" } = $$props;
    	let number;
    	let inputNumber;
    	const writable_props = ['url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		Home,
    		Login,
    		EditScreen,
    		History,
    		component_subscribe,
    		debug,
    		params,
    		url,
    		number,
    		inputNumber
    	});

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    		if ('number' in $$props) number = $$props.number;
    		if ('inputNumber' in $$props) inputNumber = $$props.inputNumber;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: ''
    	}
    });

    return app;

})();
