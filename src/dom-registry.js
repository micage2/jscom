// src/dom-registry.js
/** contract for all DOM components
 *  ctor() has to return it
 * @typedef {Object} IDomNode
 * @property {function(): HTMLElement} getHost - root node of the component
 * @property {function(): any} getInstance - food for role factories
 */


let klasses = new Map(); // clsid → { ctor, role_ctor }

let privateNodes = new WeakMap(); // iface → instance (private)

export const DomRegistry = {
    register(ctor, role_ctor) {
        const clsid = "CLS_" + Math.random().toString(36).slice(2, 11);
        klasses.set(clsid, { ctor, role_ctor });

        return clsid;
    },

    create(clsid, args = {}, role) {
        const klass = klasses.get(clsid);
        if (!klass) {
            console.warn(`No component registered for ${clsid}`);

            return null;
        }

        /** @type IDomNode */
        const iDomNode = klass.ctor(args);
        if (!iDomNode) {
            console.warn(`ctor returned null for ${clsid}`);
        }

        const host = iDomNode.getHost();
        if (!host)
            throw new Error(`Invalid host for ${clsid}`);

        const instance = iDomNode.getInstance();

        // TODO: instances should be mapped to a list of roles
        // that have been already exposed on that instance.
        // If there exists already a role for that instance
        // return the existing one

        const as = (r) => {
            const role_factory = klass.role_ctor(r);
            if (role_factory) {
                const iface = role_factory(instance);
                if(iface) {
                    iface.as = as;

                    return iface;
                }
                else {
                    console.log(`role ${r} not created for comp ${clsid}.`);

                    return null;
                }
            }
            else {
                console.log(`no role ${r} for comp ${clsid} found.`);

                return { as };
            }
        };

        const iface = as(role);
        privateNodes.set(iface, iDomNode);

        return iface;
    },

    /**
     * @param {IDomNode} inode - the component to insert
     * @param {IDomNode} itarget - where to insert
     * @param {Object} options
     * @property {"parent" | "before" | "after"} options.mode
     * @property {string} options.slot - CSS name of slot
     */
    attach(inode, itarget, options = {}) {
        const node = privateNodes.get(inode);
        if (!node)
            throw new Error(`DomNode source is not registered`);

        const target = privateNodes.get(itarget);
        if (!target)
            throw new Error(`DomNode target is not registered`);

        const newHost = node.getHost();
        if (!newHost)
            throw new Error(`source host is invalid.`);

        const targetHost = target.getHost();
        if (!targetHost)
            throw new Error(`target host is invalid.`);

        newHost.slot = options.slot || '';

        let res = null;
        switch (options.mode || "parent") {
            case "parent": res = targetHost.appendChild(newHost); break;
            case "before": res = targetHost.parentNode.insertBefore(newHost, targetHost); break;
            case "after": res = targetHost.parentNode.insertBefore(newHost, targetHost.nextSibling);
        }
        if (!res) throw new Error(`DOM insertion failed.`);
    },

    detach(childIface) {
        const child = privateNodes.get(childIface);
        if (!child) return false;

        const childRoot = child.getHost();
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

        const instance = privateNodes.get(rootIface);
        if (instance) {
            rootEl.appendChild(instance.getHost());
        }
    },

    equals(iface1, iface2) {
        return privateNodes.get(iface1) === privateNodes.get(iface2);
    }
};