// src/dom-registry.js
/** contract for all DOM components
 *  ctor() has to return it
 * @typedef {Object} IDomNode
 * @property {function(): HTMLElement} getHost - root node of the component
 * @property {function(): HTMLElement} getInstance - food for role factory
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
        // that have been already exposed
        // if there exists already a role for that instance
        // return the existing one

        const as = (r) => {
            const role_factory = klass.role_ctor(r);
            if (role_factory) {
                const iface = role_factory({ host, instance });
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

    after(inode, isibl, options = {}) {
        const sibling = privateNodes.get(isibl);
        if (!sibling)
            return false;

        const node = privateNodes.get(inode);
        if (!node)
            return false;

        const existingNode = sibling.getHost();
        if (!existingNode)
            return false;

        const newNode = node.getHost();
        if (!newNode)
            return false;

        newNode.slot = options.slot || '';
        existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);

        return true;
    },

    attach(parentIface, childIface, options = {}) {
        const parent = privateNodes.get(parentIface);
        if (!parent)
            return false;

        const child = privateNodes.get(childIface);
        if (!child)
            return false;

        const parentHost = parent.getHost();
        if (!parentHost)
            return false;

        const childRoot = child.getHost();
        if (!childRoot)
            return false;

        childRoot.slot = options.slot || '';
        parentHost.appendChild(childRoot);

        return true;
    },

    attachMany(parentIface, childIfaces, options = {}) {
        const parent = privateNodes.get(parentIface);
        if (!parent) return false;

        const parentHost = parent.getHost();
        if (!parentHost) return false;

        const fragment = document.createDocumentFragment();
        let attached = 0;

        childIfaces.forEach(childIface => {
            const child = privateNodes.get(childIface);
            if (!child) return;

            const childRoot = child.getHost();
            if (!childRoot) return;

            childRoot.slot = options.slot || '';
            fragment.appendChild(childRoot);
            attached++;
        });

        parentHost.appendChild(fragment);

        return attached === childIfaces.length;
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
            if (!DomRegistry.detach(childIface)) success = false;
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
    }
};