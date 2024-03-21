
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
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
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    const outroing = new Set();
    let outros;
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
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

    /* src/components/Header.svelte generated by Svelte v3.59.2 */

    const file$4 = "src/components/Header.svelte";

    function create_fragment$6(ctx) {
    	let header;
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			p0 = element("p");
    			p0.textContent = "3학년 4반/박도현";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "최근 수정 시각: 2024-03-12 10:08:37";
    			attr_dev(p0, "id", "title");
    			attr_dev(p0, "class", "svelte-1486ubv");
    			add_location(p0, file$4, 1, 4, 14);
    			attr_dev(p1, "id", "time");
    			attr_dev(p1, "class", "svelte-1486ubv");
    			add_location(p1, file$4, 2, 4, 48);
    			attr_dev(header, "class", "svelte-1486ubv");
    			add_location(header, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, p0);
    			append_dev(header, t1);
    			append_dev(header, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
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

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/Nav.svelte generated by Svelte v3.59.2 */

    const file$3 = "src/components/Nav.svelte";

    function create_fragment$5(ctx) {
    	let nav;
    	let p;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			p = element("p");
    			p.textContent = "분류: 21기/WP";
    			attr_dev(p, "id", "this_ryu");
    			attr_dev(p, "class", "svelte-9iu51u");
    			add_location(p, file$3, 1, 8, 19);
    			attr_dev(nav, "class", "svelte-9iu51u");
    			add_location(nav, file$3, 0, 4, 4);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
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

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Aside.svelte generated by Svelte v3.59.2 */

    function create_fragment$4(ctx) {
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Aside', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Aside> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Aside extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Aside",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.59.2 */

    function create_fragment$3(ctx) {
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Section.svelte generated by Svelte v3.59.2 */

    const file$2 = "src/components/Section.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div4;
    	let h20;
    	let ion_icon0;
    	let a0;
    	let span0;
    	let t2;
    	let div1;
    	let div0;
    	let t4;
    	let h21;
    	let ion_icon1;
    	let a1;
    	let span1;
    	let t7;
    	let div3;
    	let div2;
    	let t8;
    	let br;
    	let t9;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div4 = element("div");
    			h20 = element("h2");
    			ion_icon0 = element("ion-icon");
    			a0 = element("a");
    			a0.textContent = "1.";
    			span0 = element("span");
    			span0.textContent = " 개요";
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "21기 WP평균. 그중 커뮤니티 영역을 맡고있다. 前 테트리스 고인물 現 김승억 사무국장 놀리기 챔피언이다.";
    			t4 = space();
    			h21 = element("h2");
    			ion_icon1 = element("ion-icon");
    			a1 = element("a");
    			a1.textContent = "2.";
    			span1 = element("span");
    			span1.textContent = " 빌런력";
    			t7 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t8 = text("빌런력 890 ");
    			br = element("br");
    			t9 = text("\r\n                무시무시한 빌런력의 소유자다.  vrchat 갤러리에서 음지글을 작성하다 고로시당한 전적이 있다. 21기 테러단체 \"Disablo\"에 속해있다.");
    			set_custom_element_data(ion_icon0, "name", "chevron-down-outline");
    			set_custom_element_data(ion_icon0, "id", "down_arrow_1");
    			set_custom_element_data(ion_icon0, "class", "down_arrow svelte-baamo3");
    			add_location(ion_icon0, file$2, 2, 12, 34);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "id", "num_1");
    			add_location(a0, file$2, 2, 98, 120);
    			attr_dev(span0, "id", "headline_1");
    			attr_dev(span0, "class", "headline svelte-baamo3");
    			add_location(span0, file$2, 2, 127, 149);
    			attr_dev(h20, "class", "svelte-baamo3");
    			add_location(h20, file$2, 2, 8, 30);
    			attr_dev(div0, "id", "text_contents");
    			attr_dev(div0, "class", "svelte-baamo3");
    			add_location(div0, file$2, 4, 12, 251);
    			attr_dev(div1, "id", "section_1");
    			add_location(div1, file$2, 3, 8, 217);
    			set_custom_element_data(ion_icon1, "name", "chevron-down-outline");
    			set_custom_element_data(ion_icon1, "id", "down_arrow_2");
    			set_custom_element_data(ion_icon1, "class", "down_arrow svelte-baamo3");
    			add_location(ion_icon1, file$2, 8, 12, 403);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "id", "num_2");
    			add_location(a1, file$2, 8, 98, 489);
    			attr_dev(span1, "id", "headline_2");
    			attr_dev(span1, "class", "headline svelte-baamo3");
    			add_location(span1, file$2, 8, 127, 518);
    			attr_dev(h21, "class", "svelte-baamo3");
    			add_location(h21, file$2, 8, 8, 399);
    			add_location(br, file$2, 11, 24, 671);
    			attr_dev(div2, "id", "text_contents");
    			attr_dev(div2, "class", "svelte-baamo3");
    			add_location(div2, file$2, 10, 12, 621);
    			attr_dev(div3, "id", "section_2");
    			add_location(div3, file$2, 9, 8, 587);
    			add_location(div4, file$2, 1, 4, 15);
    			attr_dev(section, "class", "svelte-baamo3");
    			add_location(section, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div4);
    			append_dev(div4, h20);
    			append_dev(h20, ion_icon0);
    			append_dev(h20, a0);
    			append_dev(h20, span0);
    			append_dev(div4, t2);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div4, t4);
    			append_dev(div4, h21);
    			append_dev(h21, ion_icon1);
    			append_dev(h21, a1);
    			append_dev(h21, span1);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, t8);
    			append_dev(div2, br);
    			append_dev(div2, t9);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
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

    function click_title(n) {
    	var headline_string = "headline_" + n;
    	var down_arrow_string = "down_arrow_" + n;
    	var num_string = "num_" + n;
    	var section_string = "section_" + n;

    	if (document.getElementById(down_arrow_string).name === "chevron-forward-outline") {
    		document.getElementById(headline_string).style.color = "black";
    		document.getElementById(down_arrow_string).style.color = "black";
    		document.getElementById(down_arrow_string).name = "chevron-down-outline";
    		document.getElementById(num_string).style.color = "#0275d8";
    		document.getElementById(section_string).style.display = "block";
    	} else {
    		document.getElementById(headline_string).style.color = "#b3b3b3";
    		document.getElementById(down_arrow_string).style.color = "#b3b3b3";
    		document.getElementById(down_arrow_string).name = "chevron-forward-outline";
    		document.getElementById(num_string).style.color = "#80BAEB";
    		document.getElementById(section_string).style.display = "none";
    	}
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Section', slots, []);

    	window.onload = function () {
    		var e1_1 = document.getElementById("down_arrow_1");
    		var e1_2 = document.getElementById("headline_1");
    		var e2_1 = document.getElementById("down_arrow_2");
    		var e2_2 = document.getElementById("headline_2");

    		e1_1.onclick = function () {
    			click_title("1");
    		};

    		e1_2.onclick = function () {
    			click_title("1");
    		};

    		e2_1.onclick = function () {
    			click_title("2");
    		};

    		e2_2.onclick = function () {
    			click_title("2");
    		};
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ click_title });
    	return [];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Article.svelte generated by Svelte v3.59.2 */

    const file$1 = "src/components/Article.svelte";

    function create_fragment$1(ctx) {
    	let article;
    	let p;

    	const block = {
    		c: function create() {
    			article = element("article");
    			p = element("p");
    			p.textContent = "atricle";
    			add_location(p, file$1, 1, 4, 15);
    			add_location(article, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, p);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Article', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Article> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Article extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Article",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
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
    	let t2;
    	let a2;
    	let svg2;
    	let path2;
    	let t3;
    	let div0;
    	let a3;
    	let svg3;
    	let path3;
    	let t4;
    	let div3;
    	let header;
    	let t5;
    	let nav;
    	let t6;
    	let aside;
    	let t7;
    	let section;
    	let t8;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	nav = new Nav({ $$inline: true });
    	aside = new Aside({ $$inline: true });
    	section = new Section({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
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
    			div3 = element("div");
    			create_component(header.$$.fragment);
    			t5 = space();
    			create_component(nav.$$.fragment);
    			t6 = space();
    			create_component(aside.$$.fragment);
    			t7 = space();
    			create_component(section.$$.fragment);
    			t8 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(path0, "d", "M403.8 34.4c12-5 25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V160H352c-10.1 0-19.6 4.7-25.6 12.8L284 229.3 244 176l31.2-41.6C293.3 110.2 321.8 96 352 96h32V64c0-12.9 7.8-24.6 19.8-29.6zM164 282.7L204 336l-31.2 41.6C154.7 401.8 126.2 416 96 416H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H96c10.1 0 19.6-4.7 25.6-12.8L164 282.7zm274.6 188c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V416H352c-30.2 0-58.7-14.2-76.8-38.4L121.6 172.8c-6-8.1-15.5-12.8-25.6-12.8H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H96c30.2 0 58.7 14.2 76.8 38.4L326.4 339.2c6 8.1 15.5 12.8 25.6 12.8h32V320c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64z");
    			add_location(path0, file, 12, 143, 527);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "id", "random_icon");
    			attr_dev(svg0, "data-v-3070b92f", "");
    			attr_dev(svg0, "class", "svelte-4pzdcz");
    			add_location(svg0, file, 12, 45, 429);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "title", "아무 문서로 이동");
    			attr_dev(a0, "id", "random");
    			attr_dev(a0, "class", "svelte-4pzdcz");
    			add_location(a0, file, 12, 3, 387);
    			attr_dev(input, "type", "search");
    			attr_dev(input, "placeholder", "여기에서 검색");
    			attr_dev(input, "autocomplete", "off");
    			attr_dev(input, "spellcheck", "false");
    			attr_dev(input, "tabindex", "1");
    			input.value = "";
    			attr_dev(input, "id", "search_place");
    			attr_dev(input, "data-v-3070b92f", "");
    			attr_dev(input, "class", "svelte-4pzdcz");
    			add_location(input, file, 14, 4, 1334);
    			attr_dev(path1, "d", "M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z");
    			add_location(path1, file, 15, 150, 1625);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "height", "1em");
    			attr_dev(svg1, "viewBox", "0 0 512 512");
    			attr_dev(svg1, "id", "random_icon");
    			attr_dev(svg1, "data-v-3070b92f", "");
    			attr_dev(svg1, "class", "svelte-4pzdcz");
    			add_location(svg1, file, 15, 39, 1514);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "title", "검색");
    			attr_dev(a1, "id", "random");
    			attr_dev(a1, "class", "svelte-4pzdcz");
    			add_location(a1, file, 15, 4, 1479);
    			attr_dev(path2, "d", "M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z");
    			add_location(path2, file, 16, 150, 2036);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "height", "1em");
    			attr_dev(svg2, "viewBox", "0 0 448 512");
    			attr_dev(svg2, "id", "random_icon");
    			attr_dev(svg2, "data-v-3070b92f", "");
    			attr_dev(svg2, "class", "svelte-4pzdcz");
    			add_location(svg2, file, 16, 39, 1925);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "title", "이동");
    			attr_dev(a2, "id", "random");
    			attr_dev(a2, "class", "svelte-4pzdcz");
    			add_location(a2, file, 16, 4, 1890);
    			attr_dev(form, "class", "search_bar svelte-4pzdcz");
    			add_location(form, file, 13, 3, 1304);
    			attr_dev(path3, "d", "M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z");
    			add_location(path3, file, 19, 167, 2486);
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "height", "1em");
    			attr_dev(svg3, "viewBox", "0 0 448 512");
    			attr_dev(svg3, "id", "profile_icon");
    			attr_dev(svg3, "data-v-c0860ca0", "");
    			attr_dev(svg3, "data-v-76d6fdf5", "");
    			attr_dev(svg3, "class", "svelte-4pzdcz");
    			add_location(svg3, file, 19, 36, 2355);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "id", "profile_button");
    			attr_dev(a3, "class", "svelte-4pzdcz");
    			add_location(a3, file, 19, 4, 2323);
    			attr_dev(div0, "id", "profile");
    			attr_dev(div0, "class", "svelte-4pzdcz");
    			add_location(div0, file, 18, 3, 2300);
    			attr_dev(div1, "id", "search_tool");
    			attr_dev(div1, "class", "svelte-4pzdcz");
    			add_location(div1, file, 11, 2, 361);
    			attr_dev(div2, "id", "tool_bar");
    			attr_dev(div2, "class", "svelte-4pzdcz");
    			add_location(div2, file, 10, 1, 339);
    			attr_dev(div3, "id", "contents");
    			attr_dev(div3, "class", "svelte-4pzdcz");
    			add_location(div3, file, 24, 1, 2725);
    			attr_dev(main, "class", "svelte-4pzdcz");
    			add_location(main, file, 9, 0, 331);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div1, t0);
    			append_dev(div1, form);
    			append_dev(form, input);
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
    			append_dev(main, t4);
    			append_dev(main, div3);
    			mount_component(header, div3, null);
    			append_dev(div3, t5);
    			mount_component(nav, div3, null);
    			append_dev(div3, t6);
    			mount_component(aside, div3, null);
    			append_dev(div3, t7);
    			mount_component(section, div3, null);
    			append_dev(div3, t8);
    			mount_component(footer, div3, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			transition_in(aside.$$.fragment, local);
    			transition_in(section.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			transition_out(aside.$$.fragment, local);
    			transition_out(section.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(nav);
    			destroy_component(aside);
    			destroy_component(section);
    			destroy_component(footer);
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
    	let { name } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	});

    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		Header,
    		Nav,
    		Aside,
    		Footer,
    		Section,
    		Article,
    		name
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
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
//# sourceMappingURL=main.js.map
