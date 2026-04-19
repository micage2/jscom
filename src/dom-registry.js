// dom-registry.js
import { Mediator } from './shared/mediator.js';

const klasses = new Map();           // clsid → { ctor, roleFactories: [{roleName, factory}] }
const compounds = new Map();         // clsid → { ctor, info }
const privateNodes = new WeakMap();  // iface → { instance, host }
const roleMaps = new WeakMap();      // iface → Map<roleName, roleImpl>

const gen_id = (prefix = "") => 
    `${prefix}` + Math.random().toString(36).slice(2, 11);

export const DomRegistry = {

    register(ctor, config, info = {}) {
        if (!info.clsid) {
            console.log('[DOM] No clsid.', info);            
            return false;
        }

        // collect roles (supported interfaces)
        const roles = new Map();
        let default_role = null;
        const role = (name, impl, _default) => {
            roles.set(name, impl);
            if (_default) default_role = name;
        };
        
        if (typeof config === 'function') {
            config(role);
        }

        const mediator = new Mediator();

        klasses.set(info.clsid, {
            ctor, // create component function
            roles, // name → role ctor
            default_role, // name
            mediator,
            info
        });

        return true;
    },

    // Compounds are pure composition roots — no roles.
    // info: { uid, name, description } — used by app-root for the app switcher.
    registerCompound(ctor, info = {}) {
        if (!info.clsid) {
            console.log('[DOM] No clsid.', info);
            return false;
        }
        compounds.set(info.clsid, { ctor, info });
        return true;
    },

    getClassInfo(clsid) {
        const klass = klasses.get(clsid);
        return klass ? klass.info : null;
    },

    // Returns a Map<name, { name, title, root }> of all self-registered compounds
    // that provided info.name. Anonymous compounds (no name in info) are excluded.
    getCompounds() {
        const result = new Map();
        compounds.forEach(({ ctor, info }, clsid) => {
            if (!info.name) return;
            result.set(info.name, {
                name:  info.name,
                title: info.title ?? info.name,
                root:  (args) => this.createCompound(clsid, args),
            });
        });
        return result;
    },

    create(compId, options = {}) {
        const klass = klasses.get(compId);
        if (!klass) {
            console.error(`Unknown component type: ${compId}`);
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
                // ever used in the app. Maybe nice, maybe not.
                // but this way iface can keep its identity for Set
                const role = role_ctor.bind(this)(ih.instance);
                const iface = Object.assign(this, role);

                privateNodes.set(iface, ih);
                iface.role = roleName;

                return iface;
            },

            emit(msg, payload = null) {
                this.mediator.emit(msg, payload);
            },
            on(pin, cb) {
                return this.mediator.on(pin, cb);
            },
            once(pin, cb) {
                return this.mediator.once(pin, cb);
            },
        };

        // Call ctor — returns IDomNode interface object
        // const nodeInterface = klass.ctor.bind(iface)(options, iface.call.bind(iface));
        const icomp = klass.ctor.bind(iface)(options);

        // Validate protocol
        if (!icomp) {
            console.error(`Invalid IDomNode: ${compId}`);
        }

        const instance = icomp.getInstance();
        const host = icomp.getHost();

        // Store unpacked instance + host
        privateNodes.set(iface, { instance, host });
        icomp.postCreate?.bind(iface)(instance);

        return klass.default_role ? iface.as(klass.default_role) : iface;
    },

    createCompound(compound_id, options = {}) {
        const compound = compounds.get(compound_id);
        if (compound) return compound.ctor(options);
        return null;
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
