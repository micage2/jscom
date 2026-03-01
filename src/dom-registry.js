// dom-registry.js

// import { Mediator } from './shared/mediator.js';  // your existing Mediator class

const klasses = new Map();           // clsid → { ctor, roleFactories: [{roleName, factory}] }
const privateNodes = new WeakMap();  // iface → { instance, host }
const roleMaps = new WeakMap();      // iface → Map<roleName, roleImpl>
const ifaceWiring = new WeakMap();   // iface → { _outputWires: Map<roleName, Set<Mediator>>, _inputWires: Map<roleName, Mediator> }
const connections = new Map();       // key → { mediator }

const gen_clsid = (prefix = "") => 
    `${prefix}` + Math.random().toString(36).slice(2, 11);

export const DomRegistry = {

    register(ctor, config, info = {}) {
        const clsid = gen_clsid('CLSID_');
        
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

        klasses.set(clsid, { ctor, roles, actions, reactions, default_role, info });

        return clsid;
    },

    getClassInfo(clsid) {
        const klass = klasses.get(clsid);
        return klass ?? klass.info;
    },

    create(compId, options = {}) {
        const klass = klasses.get(compId);
        if (!klass) throw new Error(`Unknown component type: ${compId}`);

        // Create pure public interface object
        const iface = {
            uid: crypto.randomUUID(),
            type: compId,

            as(roleName) {
                const ih = privateNodes.get(this);
                const roleImpl = klass.roles.get(roleName);
                if (!roleImpl) {
                    console.warn(`No role '${roleName}' on ${compId} #${iface}`);
                    return null;
                }

                const iface = Object.assign({}, this, roleImpl(ih.instance))
                // const iface = { ...roleImpl(ih.instance) };
                privateNodes.set(iface, ih);

                return iface;
            },

            call: function (functionName, args) {
                const key = `${this.uid}:${functionName}`;
                const conn = connections.get(key);
                if (!conn) { // inactive
                    // console.info(`No connection for '${functionName}' on ${this.type} #${this.uid}`);
                    return null; // TODO: do we need a return value?
                }

                const sink_klass = klasses.get(conn.sinkIface.type);
                const sink_func = sink_klass.reactions.get(conn.sinkFuncName);

                const sink_ih = privateNodes.get(conn.sinkIface);
                if (typeof sink_func !== 'function') return null; // TODO: see above

                return sink_func.bind(conn.sinkIface)(args);
            }
        };

        // Call ctor — returns IDomNode interface object
        const nodeInterface = klass.ctor.bind(iface)(options, iface.call.bind(iface));

        // Validate protocol
        if (!nodeInterface ||
            typeof nodeInterface.getHost !== 'function' ||
            typeof nodeInterface.getInstance !== 'function') {
            throw new Error(`ctor for ${compId} did not return valid IDomNode interface`);
        }

        const instance = nodeInterface.getInstance();
        const host = nodeInterface.getHost();

        // Store unpacked instance + host
        privateNodes.set(iface, { instance, host });

        return klass.default_role ? iface.as(klass.default_role) : iface;
    },

    _connect(action, reaction, config = { type: number, min: 0, max: 1 }) {
    },

    connect(sourceIface, sourceFuncName, sinkIface, sinkFuncName) {
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
        if (connections.has(key))
            return false;

        connections.set(key, { sinkIface, sinkFuncName });
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