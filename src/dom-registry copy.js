// dom-registry.js
import { Mediator } from './shared/mediator.js';

const klasses = new Map();           // clsid → { ctor, roleFactories: [{roleName, factory}] }
const compounds = new Map();         // clsid → { ctor, roleFactories: [{roleName, factory}] }
const privateNodes = new WeakMap();  // iface → { instance, host }
const roleMaps = new WeakMap();      // iface → Map<roleName, roleImpl>

const gen_id = (prefix = "") => 
    `${prefix}` + Math.random().toString(36).slice(2, 11);

export const DomRegistry = {

    register(ctor, config, info = {}) {
        const clsid = gen_id('CLSID_');
        
        // collect roles (supported interfaces)
        const roles = new Map();
        let default_role = null;
        const role = (name, impl, _default) => {
            roles.set(name, impl);
            if (_default) default_role = name;
        };
        
        // collect actions (message emitter)
        const actions = new Map();
        const action = (name) => {
            actions.set(name);
        };
        
        // collect reactions (message handler)
        const reactions = new Map();
        const reaction = (name, impl) => {
            reactions.set(name, impl);
        };

        if (typeof config === 'function') {
            config(role, action, reaction);
        }

        const mediator = new Mediator();

        klasses.set(clsid, {
            ctor, // create component function
            roles, // name -> role ctor
            default_role, // name
            actions, // names[]
            reactions, // name -> handler function
            mediator, // name -> Set of handler functions
            info
        });

        return clsid;
    },

    registerCompound(ctor, config, info = {}) {
        const clsid = gen_id('CLSID_');
        
        // collect roles (supported interfaces)
        const roles = new Map();
        let default_role = null;
        const role = (name, impl, _default) => {
            roles.set(name, impl);
            if (_default) default_role = name;
        };
        
        // collect actions (message emitter)
        const actions = new Map();
        const action = (name) => {
            actions.set(name);
        };
        
        // collect reactions (message handler)
        const reactions = new Map();
        const reaction = (name, impl) => {
            reactions.set(name, impl);
        };

        if (typeof config === 'function') {
            config(role, action, reaction);
        }

        const mediator = new Mediator();

        compounds.set(clsid, {
            ctor, // create component function
            roles, // name -> role ctor
            default_role, // name
            actions, // names[]
            reactions, // name -> handler function
            mediator, // name -> Set of handler functions
            info
        });

        return clsid;
    },

    getClassInfo(clsid) {
        const klass = klasses.get(clsid);
        return klass ? klass.info : null;
    },

    create(compId, options = {}) {
        const klass = klasses.get(compId);
        if (!klass) {
            console.error(`[DOM.create] Unknown component type: ${compId}`);
            return null;
        }

        // Create pure public interface object
        const iface = {
            // uid: crypto.randomUUID(),
            uid: gen_id(),
            type: compId,
            role: 'unknown',
            mediator: new Mediator(),

            as(roleName) {
                const ih = privateNodes.get(this);
                const role_ctor = klass.roles.get(roleName);
                if (!role_ctor) {
                    console.warn(`No role '${roleName}' on ${compId} #${iface}`);
                    return null;
                }

                // Note: careful! iface is accumulating all role methods
                // ever used in the app. Maybe nice, but most probably not.
                // This way iface can keep its identity for Set and Map.
                // TODO: have to look for a better way
                const role = role_ctor.bind(this)(ih.instance);
                const iface = Object.assign(this, role);

                privateNodes.set(iface, ih);
                iface.role = roleName;

                return iface;
            },

            _call: function (functionName, args = {}) {
                const key = `${this.uid}:${functionName}`;
                const conn = connections.get(key);
                if (!conn) { // inactive
                    const info = klass.info;
                    // console.info(`No connection for '${functionName}' on ${info.name || this.type} #${this.uid}`);
                    return null;
                }

                const sink_klass = klasses.get(conn.sinkIface.type);
                const sink_func = sink_klass.reactions.get(conn.sinkFuncName);
                if (typeof sink_func !== 'function') {
                    console.error('Sink is not a function: ' + sink_klass.info);                    
                    return null;
                }

                // klass.mediator.emit(functionName, args);

                const transformed_args = typeof conn.transformer === 'function' 
                    ? conn.transformer(args) : args;

                return sink_func.bind(conn.sinkIface)(transformed_args);
            },

            emit(msg, payload = null) {
                this.mediator.emit(msg, payload);
            },

            // add reaction to klass
            on(pin, cb) {
                // klass: { ctor, roles, actions, reactions, default_role, info }
                // source klass is our own (already in closure)
                this.mediator.on(pin, cb);
            }
        };

        // Call ctor — returns IDomNode interface object
        // const nodeInterface = klass.ctor.bind(iface)(options, iface.call.bind(iface));
        const icomp = klass.ctor.bind(iface)(options);

        // Validate protocol
        if (!icomp ||
            typeof icomp.getHost !== 'function' ||
            typeof icomp.getInstance !== 'function') {
            throw new Error(`ctor for ${compId} did not return valid IDomNode interface`);
        }

        const instance = icomp.getInstance();
        const host = icomp.getHost();

        // Store unpacked instance + host
        privateNodes.set(iface, { instance, host });

        return klass.default_role ? iface.as(klass.default_role) : iface;
    },

    createCompound(compound_id, options = {}) {
        const compound = compounds.get(compound_id);
        if (compound) return compound.ctor(options);
        return null;
    },

    connect(sourceIface, sourceFuncName, sinkIface, sinkFuncName, transformer = null) {
        if (!sourceIface) {
            console.warn(`[DOM.connect] no source for ${sourceFuncName}`)
            return false;
        }
        if (!sinkIface) {
            console.warn("[DOM.connect] no sink")
            return false;
        }

        const sourceKlass = klasses.get(sourceIface.type);
        const sinkKlass = klasses.get(sinkIface.type);

        const sinkFunc = sinkKlass.reactions.get(sinkFuncName);

        const key = `${sourceIface.uid}:${sourceFuncName}`;
        if (connections.has(key)) {
            console.log(`[DOM.connect] key already exists: ${key}.`);
            return false;
        }

        connections.set(key, { sinkIface, sinkFuncName, transformer });
        return true;
    },

    attach(sourceIface, targetIface, options = {}) {
        const node_source = privateNodes.get(sourceIface);
        if (!node_source) {
            console.warn(`[DOM.attach] Invalid source.`);            
            return false;
        }

        const node_target = privateNodes.get(targetIface);
        if (!node_target) {
            console.warn(`[DOM.attach] Invalid target.`);            
            return false;
        }

        const sourceHost = node_source.host;
        if (!sourceHost) {
            console.warn(`[DOM.attach] No source host`);
            return false;
        }
        const targetHost = node_target.host;
        if (!targetHost) {
            console.warn(`[DOM.attach] No target host`);
            return false;
        }


        sourceHost.slot = options.slot || '';

        switch (options.mode || "parent") {
            case "parent":
                targetHost.appendChild(sourceHost);
                break;
            case "before":
                targetHost.parentNode?.insertBefore(sourceHost, targetHost);
                break;
            case "after":
                targetHost.parentNode?.insertBefore(sourceHost, targetHost.nextSibling);
                break;
            default:
                console.warn(`Invalid attach mode: ${mode}`);
                return false;
        }

        return true;
    },

    detach(childIface) {
        const child = privateNodes.get(childIface);
        if (!child) return false;

        const childRoot = child.host;
        if (!childRoot || !childRoot.parentNode) return false;

        childRoot.parentNode.removeChild(childRoot);
        return true;
    },

    detachMany(childIfaces) {
        let success = true;
        childIfaces.forEach(childIface => {
            if (!this.detach(childIface)) success = false;
        });
        return success;
    },

    mount(rootIface) {
        let rootEl = document.getElementById('app-root');
        if (!rootEl) {
            rootEl = document.createElement('div');
            rootEl.id = 'app-root';
            rootEl.style.cssText = 'height:100vh;width:100vw;margin:0;overflow:hidden;';
            document.body.appendChild(rootEl);
        }

        const { host, instance } = privateNodes.get(rootIface);
        if (instance && host) {
            rootEl.appendChild(host);
        }
        else {
            console.warn(`No node info for CLS: ${rootIface.type}`);            
        }
    },

    equals(iface1, iface2) {
        return privateNodes.get(iface1) === privateNodes.get(iface2);
    }
};